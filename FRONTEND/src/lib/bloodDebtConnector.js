// ============================================================
//  bloodDebtConnector.js — BLOOD & DEBT | Protocolo x402
//  Conector Web3 para Avalanche L1 "eljuego" (ChainID: 12345)
//  Stack: Ethers.js v6 + MetaMask
//
//  Arquitectura de contratos (genesis-chainsaw.json):
//    PROXY principal  → 0x0feedc0de0000000000000000000000000000000
//    Implementación   → 0x0c0deba5e0000000000000000000000000000000
//    Token $BLOOD     → 0x9c00629ce712b0255b17a4a657171acd15720b8c
//    ProxyAdmin       → 0xa0affe1234567890abcdef1234567890abcdef34
// ============================================================

import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";

// ─────────────────────────────────────────────
//  CONFIGURACIÓN DE RED — Avalanche L1 "eljuego"
// ─────────────────────────────────────────────

export const CHAIN_CONFIG = {
  chainId: 12345,
  chainIdHex: "0x3039",
  chainName: "Blood & Debt — eljuego L1",
  rpcUrl: "http://127.0.0.1:9650/ext/bc/eljuego/rpc", // Ajusta si tu RPC local es distinto
  nativeCurrency: {
    name: "SOUL Token",
    symbol: "SOUL",
    decimals: 18,
  },
};

// ─────────────────────────────────────────────
//  DIRECCIONES DE CONTRATOS
// ─────────────────────────────────────────────

// Siempre usa el PROXY, no la implementación directa.
// El proxy es el punto de entrada estable; la implementación puede cambiar con upgrades.
export const CONTRACT_ADDRESS = "0x0feedc0de0000000000000000000000000000000";
export const BLOOD_TOKEN_ADDRESS = "0x9c00629ce712b0255b17a4a657171acd15720b8c";

// ─────────────────────────────────────────────
//  ABIs
// ─────────────────────────────────────────────

// ABI del contrato principal Blood & Debt
// Expone las funciones que el frontend necesita llamar.
// Expande este array a medida que despliegues más funciones.
export const CONTRACT_ABI = [
  // ── Escritura ──────────────────────────────
  // Acción central del juego: sellar un pacto con sangre
  "function firmarPacto() external",

  // Protocolo x402: pago de sangre antes de ejecutar habilidad especial.
  // Recibe la cantidad de $BLOOD a transferir al demonio como coste de habilidad.
  "function ataqueEspecial(uint256 costeSangre) external",

  // ── Lectura ────────────────────────────────
  // Consulta el estado del jugador en el contrato
  "function obtenerEstadoJugador(address jugador) external view returns (uint256 salud, uint256 deuda, bool pactActivo)",

  // Agrega más funciones según evolucione tu contrato:
  // "function obtenerRango(address jugador) external view returns (uint256)",
];

// ABI estándar ERC-20 (mínimo necesario)
export const BLOOD_TOKEN_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

// ─────────────────────────────────────────────
//  HELPERS INTERNOS
// ─────────────────────────────────────────────

/**
 * Devuelve un BrowserProvider conectado a MetaMask.
 * Lanza un error descriptivo si MetaMask no está disponible.
 */
function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "MetaMask no detectado. Instala la extensión para acceder al ritual."
    );
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Solicita a MetaMask que agregue/cambie a la red eljuego (ChainID 12345).
 * Útil si el usuario está en Mainnet u otra red al conectar.
 */
async function switchToElJuego() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
    });
  } catch (switchError) {
    // Código 4902: la red no está agregada en MetaMask → la agregamos
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_CONFIG.chainIdHex,
            chainName: CHAIN_CONFIG.chainName,
            rpcUrls: [CHAIN_CONFIG.rpcUrl],
            nativeCurrency: CHAIN_CONFIG.nativeCurrency,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// ─────────────────────────────────────────────
//  FUNCIÓN 1: Conectar Wallet
// ─────────────────────────────────────────────

/**
 * Solicita acceso a la wallet del usuario y verifica que esté en la red correcta.
 *
 * @returns {Promise<string>} La dirección de la cuenta conectada.
 * @throws Si MetaMask no está disponible o el usuario rechaza la conexión.
 *
 * USO EN DASHBOARD:
 *   const address = await connectWallet();
 *   // Guarda address en estado de React para mostrar en UI
 */
export async function connectWallet() {
  const provider = getProvider();

  // Solicita acceso — abre el popup de MetaMask
  const accounts = await provider.send("eth_requestAccounts", []);

  if (!accounts || accounts.length === 0) {
    throw new Error("No se obtuvo ninguna cuenta de MetaMask.");
  }

  // Verifica que estemos en la red correcta; si no, la cambia automáticamente
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_CONFIG.chainId) {
    await switchToElJuego();
  }

  return accounts[0];
}

// ─────────────────────────────────────────────
//  FUNCIÓN 2: Leer Saldo de $BLOOD
// ─────────────────────────────────────────────

/**
 * Lee el saldo de $BLOOD de una dirección usando `balanceOf`.
 *
 * @param {string} address - Dirección del jugador.
 * @returns {Promise<{raw: bigint, formatted: string, symbol: string}>}
 *   - raw: BigInt con el valor en unidades mínimas (wei equivalente)
 *   - formatted: string legible (ej: "1250.75")
 *   - symbol: "BLOOD" u otro según el contrato
 *
 * USO EN DASHBOARD:
 *   const { formatted, symbol } = await getBloodBalance(account);
 *   setBloodBalance(`${formatted} ${symbol}`); // → "1250.75 BLOOD"
 */
export async function getBloodBalance(address) {
  const provider = getProvider();
  const tokenContract = new Contract(BLOOD_TOKEN_ADDRESS, BLOOD_TOKEN_ABI, provider);

  const [raw, decimals, symbol] = await Promise.all([
    tokenContract.balanceOf(address),
    tokenContract.decimals(),
    tokenContract.symbol(),
  ]);

  return {
    raw,
    formatted: formatUnits(raw, decimals),
    symbol,
  };
}

// ─────────────────────────────────────────────
//  FUNCIÓN 3: firmarPacto()
// ─────────────────────────────────────────────

/**
 * Ejecuta `firmarPacto()` en el contrato principal.
 * Espera confirmación on-chain antes de resolver.
 *
 * @param {string} account - Dirección del jugador firmante.
 * @returns {Promise<object>} El receipt de la transacción minada.
 * @throws Si el usuario rechaza, no tiene saldo para gas, o el contrato revierte.
 *
 * USO EN DASHBOARD (reemplaza la lógica de handleUseAbility):
 *   try {
 *     const receipt = await callFirmarPacto(account);
 *     addLog('x402 BLOOD PAYMENT EXECUTED', 'system');
 *   } catch (err) {
 *     addLog(err.message, 'fatal');
 *   }
 */
export async function callFirmarPacto(account) {
  const provider = getProvider();
  const signer = await provider.getSigner(account);
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // Envía la transacción — abre popup de confirmación en MetaMask
  const tx = await contract.firmarPacto();

  // Espera a que sea minada (confirmación on-chain)
  const receipt = await tx.wait();
  return receipt;
}

// ─────────────────────────────────────────────
//  FUNCIÓN 4: Protocolo x402 — Ataque Especial
// ─────────────────────────────────────────────

/**
 * Implementa el Protocolo x402: antes de ejecutar la habilidad especial,
 * verifica que el jugador tenga suficiente $BLOOD y llama a `ataqueEspecial(costeSangre)`.
 *
 * El contrato puede manejar la transferencia internamente (mediante allowance previa),
 * o simplemente verificar el balance. Depende de tu implementación Solidity.
 *
 * FLUJO:
 *   1. Verificar balance de $BLOOD del jugador
 *   2. Si es insuficiente → lanzar error claro antes de abrir MetaMask
 *   3. Si el contrato necesita allowance → aprobar primero (approve)
 *   4. Ejecutar ataqueEspecial(costeSangre)
 *   5. Esperar minado
 *   6. Retornar receipt
 *
 * @param {string} account - Dirección del jugador.
 * @param {string|number} costeSangre - Cantidad de $BLOOD en unidades legibles (ej: "12" = 12 BLOOD)
 * @param {boolean} [needsApproval=false] - Si el contrato requiere allowance previa para transferir BLOOD
 * @returns {Promise<object>} El receipt de la transacción minada.
 *
 * USO EN DASHBOARD (botón "Use Ability" en Arena.tsx):
 *   try {
 *     setIsAbilityLoading(true);
 *     const receipt = await executeSpecialAttack(account, "12");
 *     addLog('x402 BLOOD PAYMENT EXECUTED', 'system');
 *     await refreshBalance(); // actualiza el saldo en UI
 *   } catch (err) {
 *     addLog(err.message, 'fatal');
 *   } finally {
 *     setIsAbilityLoading(false);
 *   }
 */
export async function executeSpecialAttack(account, costeSangre, needsApproval = false) {
  const provider = getProvider();

  // ── Paso 1: Verificar balance antes de abrir MetaMask ──────────
  const tokenContract = new Contract(BLOOD_TOKEN_ADDRESS, BLOOD_TOKEN_ABI, provider);
  const [rawBalance, decimals] = await Promise.all([
    tokenContract.balanceOf(account),
    tokenContract.decimals(),
  ]);

  // Convierte el coste a unidades del token (con decimales)
  const costeBigInt = parseUnits(String(costeSangre), decimals);

  if (rawBalance < costeBigInt) {
    const tienes = formatUnits(rawBalance, decimals);
    throw new Error(
      `Sangre insuficiente. Necesitas ${costeSangre} $BLOOD pero solo tienes ${tienes}. ` +
      `El demonio exige más. El pacto no puede sellar.`
    );
  }

  // ── Paso 2 (opcional): Aprobar allowance si el contrato lo requiere ──
  // Algunos contratos hacen transferFrom internamente. Si el tuyo lo hace,
  // descomenta este bloque y pon needsApproval = true al llamar la función.
  if (needsApproval) {
    const signer = await provider.getSigner(account);
    const tokenWithSigner = new Contract(BLOOD_TOKEN_ADDRESS, BLOOD_TOKEN_ABI, signer);

    const currentAllowance = await tokenWithSigner.allowance(account, CONTRACT_ADDRESS);

    if (currentAllowance < costeBigInt) {
      // Aprueba exactamente el coste (mínimo privilegio)
      const approveTx = await tokenWithSigner.approve(CONTRACT_ADDRESS, costeBigInt);
      await approveTx.wait(); // Espera confirmación del approve antes de continuar
    }
  }

  // ── Paso 3: Ejecutar el ataque especial ───────────────────────
  const signer = await provider.getSigner(account);
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  const tx = await contract.ataqueEspecial(costeBigInt);
  const receipt = await tx.wait();
  return receipt;
}

// ─────────────────────────────────────────────
//  LISTENERS DE METAMASK
// ─────────────────────────────────────────────

/**
 * Registra los listeners de MetaMask para cambios de cuenta y red.
 * Llama a esto UNA VEZ al montar el componente raíz (App.tsx o Dashboard.tsx).
 *
 * @param {Function} onAccountChange - Callback con la nueva cuenta (string | null)
 * @param {Function} onNetworkChange - Callback al cambiar de red (recarga recomendada)
 * @returns {Function} Función de cleanup para removeEventListener
 *
 * USO EN DASHBOARD (useEffect):
 *   useEffect(() => {
 *     const cleanup = registerMetaMaskListeners(
 *       (newAccount) => {
 *         setAccount(newAccount);
 *         if (newAccount) refreshBalance(newAccount);
 *         else setBloodBalance("0");
 *       },
 *       () => window.location.reload()
 *     );
 *     return cleanup;
 *   }, []);
 */
export function registerMetaMaskListeners(onAccountChange, onNetworkChange) {
  if (!window.ethereum) return () => {};

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // Wallet desconectada o sin cuentas autorizadas
      onAccountChange(null);
    } else {
      onAccountChange(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    // La práctica recomendada por MetaMask es recargar al cambiar de red
    // para evitar inconsistencias en el provider
    onNetworkChange();
  };

  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", handleChainChanged);

  // Retorna la función de cleanup
  return () => {
    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    window.ethereum.removeListener("chainChanged", handleChainChanged);
  };
}

// ─────────────────────────────────────────────
//  FUNCIÓN DE RESTAURACIÓN DE SESIÓN
// ─────────────────────────────────────────────

/**
 * Consulta silenciosamente si ya hay una cuenta autorizada en MetaMask
 * (sin abrir popup). Úsalo al montar la app para restaurar sesión automáticamente.
 *
 * @returns {Promise<string|null>} La dirección activa, o null si no hay sesión.
 *
 * USO EN DASHBOARD (useEffect al montar):
 *   useEffect(() => {
 *     restoreSession().then(account => {
 *       if (account) {
 *         setAccount(account);
 *         getBloodBalance(account).then(b => setBloodBalance(b.formatted));
 *       }
 *     });
 *   }, []);
 */
export async function restoreSession() {
  if (!window.ethereum) return null;

  try {
    const provider = getProvider();
    const accounts = await provider.send("eth_accounts", []);
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
//  MANEJO DE ERRORES — REFERENCIA
// ─────────────────────────────────────────────
//
//  Estos son los códigos/mensajes más comunes que verás en el catch:
//
//  err.code === 4001
//    → Usuario rechazó la transacción en MetaMask
//    → Muestra: "Transacción cancelada. El pacto fue rechazado."
//
//  err.code === 4902
//    → La red no está en MetaMask (manejado en switchToElJuego automáticamente)
//
//  err.code === "CALL_EXCEPTION"
//    → El contrato revirtió (require/revert en Solidity)
//    → err.reason puede tener el mensaje del revert
//    → Muestra: "El contrato rechazó la operación: " + err.reason
//
//  err.code === "INSUFFICIENT_FUNDS"
//    → El usuario no tiene SOUL para pagar el gas
//    → Muestra: "Gas insuficiente. Necesitas SOUL para las fees de la red."
//
//  err.code === "NETWORK_ERROR"
//    → El nodo local no responde (probablemente el validador está apagado)
//    → Muestra: "No se puede conectar a la red. ¿Está corriendo el nodo?"
//
//  err.message.includes("sangre insuficiente")
//    → Error lanzado por executeSpecialAttack antes de enviar la tx
//    → Muestra directamente err.message (ya es legible)
//
// ─────────────────────────────────────────────
//  EJEMPLO DE INTEGRACIÓN EN Dashboard.tsx
// ─────────────────────────────────────────────
//
//  // 1. Reemplaza handleUseAbility por esto:
//  const handleUseAbility = async () => {
//    if (isAbilityLoading || !account || healthRef.current <= 0) return;
//    setIsAbilityLoading(true);
//
//    try {
//      await executeSpecialAttack(account, "12"); // 12 $BLOOD de coste
//      const { formatted } = await getBloodBalance(account);
//      setBloodBalance(formatted);
//      setLogs(prev => [...prev, {
//        timestamp: getTimestamp(),
//        text: 'x402 BLOOD PAYMENT EXECUTED',
//        severity: 'system',
//      }].slice(-10));
//    } catch (err) {
//      const msg = err.code === 4001
//        ? 'PACTO RECHAZADO POR EL JUGADOR.'
//        : err.code === 'CALL_EXCEPTION'
//          ? `CONTRATO REVIRTIÓ: ${err.reason || 'error desconocido'}`
//          : err.message || 'ERROR DESCONOCIDO EN EL RITUAL.';
//      setLogs(prev => [...prev, {
//        timestamp: getTimestamp(),
//        text: msg,
//        severity: 'fatal',
//      }].slice(-10));
//    } finally {
//      setIsAbilityLoading(false);
//    }
//  };
//
//  // 2. Al montar el componente:
//  useEffect(() => {
//    restoreSession().then(addr => {
//      if (addr) {
//        setAccount(addr);
//        getBloodBalance(addr).then(b => setBloodBalance(b.formatted));
//      }
//    });
//    const cleanup = registerMetaMaskListeners(
//      (newAddr) => {
//        setAccount(newAddr);
//        if (newAddr) getBloodBalance(newAddr).then(b => setBloodBalance(b.formatted));
//        else setBloodBalance("0");
//      },
//      () => window.location.reload()
//    );
//    return cleanup;
//  }, []);
