// ============================================================
//  useContract.js — BLOOD & DEBT
//  Hook principal de React para interacción con blockchain
//  Importa las funciones puras de lib/bloodDebtConnector.js
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  connectWallet,
  getBloodBalance,
  callFirmarPacto,
  executeSpecialAttack,
  registerMetaMaskListeners,
  restoreSession,
} from "../lib/bloodDebtConnector";

export function useContract() {
  const [account, setAccount]           = useState(null);
  const [bloodBalance, setBloodBalance] = useState("0");
  const [pactLoading, setPactLoading]   = useState(false);
  const [txLoading, setTxLoading]       = useState(false);
  const [error, setError]               = useState(null);

  // ── Helpers ─────────────────────────────────────────────

  const refreshBloodBalance = useCallback(async (address) => {
    try {
      const { formatted } = await getBloodBalance(address);
      setBloodBalance(formatted);
    } catch (err) {
      console.error("[Blood & Debt] Error leyendo saldo $BLOOD:", err);
      setBloodBalance("0");
    }
  }, []);

  const parseError = (err) => {
    if (err.code === 4001)              return "Transacción cancelada. El pacto fue rechazado.";
    if (err.code === "CALL_EXCEPTION")  return `El contrato rechazó la operación: ${err.reason || "revert sin mensaje"}`;
    if (err.code === "INSUFFICIENT_FUNDS") return "Gas insuficiente. Necesitas SOUL para las fees de la red.";
    if (err.code === "NETWORK_ERROR")   return "No se puede conectar a la red. ¿Está corriendo el nodo?";
    return err.message || "Error desconocido en el ritual.";
  };

  // ── Conexión ─────────────────────────────────────────────

  const connect = useCallback(async () => {
    setError(null);
    setTxLoading(true);
    try {
      const address = await connectWallet();
      setAccount(address);
      await refreshBloodBalance(address);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setTxLoading(false);
    }
  }, [refreshBloodBalance]);

  // ── firmarPacto() ────────────────────────────────────────

  const firmarPacto = useCallback(async () => {
    if (!account) {
      setError("Conecta tu wallet antes de sellar un pacto.");
      return null;
    }
    setError(null);
    setPactLoading(true);
    try {
      const receipt = await callFirmarPacto(account);
      await refreshBloodBalance(account);
      return receipt;
    } catch (err) {
      setError(parseError(err));
      return null;
    } finally {
      setPactLoading(false);
    }
  }, [account, refreshBloodBalance]);

  // ── Protocolo x402 — Ataque Especial ────────────────────

  const ataqueEspecial = useCallback(async (costeSangre = "12") => {
    if (!account) {
      setError("Conecta tu wallet antes de ejecutar una habilidad.");
      return null;
    }
    setError(null);
    setPactLoading(true);
    try {
      const receipt = await executeSpecialAttack(account, costeSangre);
      await refreshBloodBalance(account);
      return receipt;
    } catch (err) {
      setError(parseError(err));
      return null;
    } finally {
      setPactLoading(false);
    }
  }, [account, refreshBloodBalance]);

  // ── Restaurar sesión + listeners MetaMask ────────────────

  useEffect(() => {
    // Restaura sesión silenciosamente al montar
    restoreSession().then((address) => {
      if (address) {
        setAccount(address);
        refreshBloodBalance(address);
      }
    });

    // Escucha cambios de cuenta y red
    const cleanup = registerMetaMaskListeners(
      (newAddress) => {
        setAccount(newAddress);
        if (newAddress) refreshBloodBalance(newAddress);
        else setBloodBalance("0");
      },
      () => window.location.reload()
    );

    return cleanup;
  }, [refreshBloodBalance]);

  // ── API pública ──────────────────────────────────────────

  return {
    account,
    bloodBalance,
    pactLoading,
    txLoading,
    error,
    connect,
    firmarPacto,
    ataqueEspecial,
    refreshBloodBalance,
  };
}
