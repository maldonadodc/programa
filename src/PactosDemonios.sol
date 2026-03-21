// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PactosDemonios {
    struct Demonio {
        string nombre;
        string demonType;
        uint256 ataque;
        uint256 defensa;
        int256 reputacionRequerida;
    }

    mapping(address => int256) public reputacionJugador;
    mapping(address => uint256) public pactoActivo;
    mapping(uint256 => Demonio) public demonios; // Ahora es public para leer directo

    uint256 public nextId = 1;

    // Función manual para asegurar que los datos entren
    function registrarDemonio(string memory _nom, string memory _type, uint256 _at, uint256 _def, int256 _rep) public {
        demonios[nextId] = Demonio({
    nombre: _nom,
    demonType: _type,
    ataque: _at,
    defensa: _def,
    reputacionRequerida: _rep
});
        nextId++;
    }

    function consultarDemonio(uint256 id) public view returns (string memory, uint256, uint256) {
        Demonio memory d = demonios[id];
        // Si el nombre está vacío, es que no existe
        require(bytes(d.nombre).length > 0, "Demonio no encontrado en la DB");
        return (d.nombre, d.ataque, d.defensa);
    }
}