export default {
  "contractName": "ERC165",
  "abi": [
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "metadata": "{\"compiler\":{\"version\":\"0.5.12+commit.7709ece9\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"Implementation of the `IERC165` interface. * Contracts may inherit from this and call `_registerInterface` to declare their support of an interface.\",\"methods\":{\"supportsInterface(bytes4)\":{\"details\":\"See `IERC165.supportsInterface`.     * Time complexity O(1), guaranteed to always use less than 30 000 gas.\"}}},\"userdoc\":{\"methods\":{}}},\"settings\":{\"compilationTarget\":{\"/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/ERC165.sol\":\"ERC165\"},\"evmVersion\":\"petersburg\",\"libraries\":{},\"optimizer\":{\"enabled\":false,\"runs\":200},\"remappings\":[]},\"sources\":{\"/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/ERC165.sol\":{\"keccak256\":\"0xac2eacd7e7762e275442f28f21d821544df5aae2ed7698af13be8c41b7005e2e\",\"urls\":[\"bzz-raw://8bdbefb642e7b08535c66bbf074e576cfef2300cdf910c1e0b211f6393833a28\",\"dweb:/ipfs/QmQhfx2Ufr8a2gFXm3KogL66xGgAuAWMwcamkWFKGG6Vya\"]},\"/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/IERC165.sol\":{\"keccak256\":\"0x661553e43d7c4fbb2de504e5999fd5c104d367488350ed5bf023031bd1ba5ac5\",\"urls\":[\"bzz-raw://b40442c5b350b57b88a081a1eacd2bac962d4ecc1f029f5447a18986f08f6f14\",\"dweb:/ipfs/QmV7wjtRf11ibUHh4g8JjuhMpy68pPhV95L2y46UBoRfsZ\"]}},\"version\":1}",
  "bytecode": "0x",
  "deployedBytecode": "0x",
  "sourceMap": "",
  "deployedSourceMap": "",
  "source": "pragma solidity ^0.5.0;\n\nimport \"./IERC165.sol\";\n\n/**\n * @dev Implementation of the `IERC165` interface.\n *\n * Contracts may inherit from this and call `_registerInterface` to declare\n * their support of an interface.\n */\ncontract ERC165 is IERC165 {\n    /*\n     * bytes4(keccak256('supportsInterface(bytes4)')) == 0x01ffc9a7\n     */\n    bytes4 private constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;\n\n    /**\n     * @dev Mapping of interface ids to whether or not it's supported.\n     */\n    mapping(bytes4 => bool) private _supportedInterfaces;\n\n    constructor () internal {\n        // Derived contracts need only register support for their own interfaces,\n        // we register support for ERC165 itself here\n        _registerInterface(_INTERFACE_ID_ERC165);\n    }\n\n    /**\n     * @dev See `IERC165.supportsInterface`.\n     *\n     * Time complexity O(1), guaranteed to always use less than 30 000 gas.\n     */\n    function supportsInterface(bytes4 interfaceId) external view returns (bool) {\n        return _supportedInterfaces[interfaceId];\n    }\n\n    /**\n     * @dev Registers the contract as an implementer of the interface defined by\n     * `interfaceId`. Support of the actual ERC165 interface is automatic and\n     * registering its interface id is not required.\n     *\n     * See `IERC165.supportsInterface`.\n     *\n     * Requirements:\n     *\n     * - `interfaceId` cannot be the ERC165 invalid interface (`0xffffffff`).\n     */\n    function _registerInterface(bytes4 interfaceId) internal {\n        require(interfaceId != 0xffffffff, \"ERC165: invalid interface id\");\n        _supportedInterfaces[interfaceId] = true;\n    }\n}\n",
  "sourcePath": "C:\\Users\\socket_var\\Desktop\\px-bootcamp\\contracts\\openzeppelin-solidity\\contracts\\introspection\\ERC165.sol",
  "ast": {
    "absolutePath": "/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/ERC165.sol",
    "exportedSymbols": {
      "ERC165": [
        4467
      ]
    },
    "id": 4468,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 4417,
        "literals": [
          "solidity",
          "^",
          "0.5",
          ".0"
        ],
        "nodeType": "PragmaDirective",
        "src": "0:23:32"
      },
      {
        "absolutePath": "/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/IERC165.sol",
        "file": "./IERC165.sol",
        "id": 4418,
        "nodeType": "ImportDirective",
        "scope": 4468,
        "sourceUnit": 4672,
        "src": "25:23:32",
        "symbolAliases": [],
        "unitAlias": ""
      },
      {
        "baseContracts": [
          {
            "arguments": null,
            "baseName": {
              "contractScope": null,
              "id": 4419,
              "name": "IERC165",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 4671,
              "src": "241:7:32",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_IERC165_$4671",
                "typeString": "contract IERC165"
              }
            },
            "id": 4420,
            "nodeType": "InheritanceSpecifier",
            "src": "241:7:32"
          }
        ],
        "contractDependencies": [
          4671
        ],
        "contractKind": "contract",
        "documentation": "@dev Implementation of the `IERC165` interface.\n * Contracts may inherit from this and call `_registerInterface` to declare\ntheir support of an interface.",
        "fullyImplemented": true,
        "id": 4467,
        "linearizedBaseContracts": [
          4467,
          4671
        ],
        "name": "ERC165",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "constant": true,
            "id": 4423,
            "name": "_INTERFACE_ID_ERC165",
            "nodeType": "VariableDeclaration",
            "scope": 4467,
            "src": "338:57:32",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_bytes4",
              "typeString": "bytes4"
            },
            "typeName": {
              "id": 4421,
              "name": "bytes4",
              "nodeType": "ElementaryTypeName",
              "src": "338:6:32",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes4",
                "typeString": "bytes4"
              }
            },
            "value": {
              "argumentTypes": null,
              "hexValue": "30783031666663396137",
              "id": 4422,
              "isConstant": false,
              "isLValue": false,
              "isPure": true,
              "kind": "number",
              "lValueRequested": false,
              "nodeType": "Literal",
              "src": "385:10:32",
              "subdenomination": null,
              "typeDescriptions": {
                "typeIdentifier": "t_rational_33540519_by_1",
                "typeString": "int_const 33540519"
              },
              "value": "0x01ffc9a7"
            },
            "visibility": "private"
          },
          {
            "constant": false,
            "id": 4427,
            "name": "_supportedInterfaces",
            "nodeType": "VariableDeclaration",
            "scope": 4467,
            "src": "489:52:32",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
              "typeString": "mapping(bytes4 => bool)"
            },
            "typeName": {
              "id": 4426,
              "keyType": {
                "id": 4424,
                "name": "bytes4",
                "nodeType": "ElementaryTypeName",
                "src": "497:6:32",
                "typeDescriptions": {
                  "typeIdentifier": "t_bytes4",
                  "typeString": "bytes4"
                }
              },
              "nodeType": "Mapping",
              "src": "489:23:32",
              "typeDescriptions": {
                "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
                "typeString": "mapping(bytes4 => bool)"
              },
              "valueType": {
                "id": 4425,
                "name": "bool",
                "nodeType": "ElementaryTypeName",
                "src": "507:4:32",
                "typeDescriptions": {
                  "typeIdentifier": "t_bool",
                  "typeString": "bool"
                }
              }
            },
            "value": null,
            "visibility": "private"
          },
          {
            "body": {
              "id": 4434,
              "nodeType": "Block",
              "src": "572:193:32",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 4431,
                        "name": "_INTERFACE_ID_ERC165",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 4423,
                        "src": "737:20:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      ],
                      "id": 4430,
                      "name": "_registerInterface",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 4466,
                      "src": "718:18:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_nonpayable$_t_bytes4_$returns$__$",
                        "typeString": "function (bytes4)"
                      }
                    },
                    "id": 4432,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "718:40:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_tuple$__$",
                      "typeString": "tuple()"
                    }
                  },
                  "id": 4433,
                  "nodeType": "ExpressionStatement",
                  "src": "718:40:32"
                }
              ]
            },
            "documentation": null,
            "id": 4435,
            "implemented": true,
            "kind": "constructor",
            "modifiers": [],
            "name": "",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4428,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "560:2:32"
            },
            "returnParameters": {
              "id": 4429,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "572:0:32"
            },
            "scope": 4467,
            "src": "548:217:32",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 4446,
              "nodeType": "Block",
              "src": "991:57:32",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "baseExpression": {
                      "argumentTypes": null,
                      "id": 4442,
                      "name": "_supportedInterfaces",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 4427,
                      "src": "1008:20:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
                        "typeString": "mapping(bytes4 => bool)"
                      }
                    },
                    "id": 4444,
                    "indexExpression": {
                      "argumentTypes": null,
                      "id": 4443,
                      "name": "interfaceId",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 4437,
                      "src": "1029:11:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes4",
                        "typeString": "bytes4"
                      }
                    },
                    "isConstant": false,
                    "isLValue": true,
                    "isPure": false,
                    "lValueRequested": false,
                    "nodeType": "IndexAccess",
                    "src": "1008:33:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "functionReturnParameters": 4441,
                  "id": 4445,
                  "nodeType": "Return",
                  "src": "1001:40:32"
                }
              ]
            },
            "documentation": "@dev See `IERC165.supportsInterface`.\n     * Time complexity O(1), guaranteed to always use less than 30 000 gas.",
            "id": 4447,
            "implemented": true,
            "kind": "function",
            "modifiers": [],
            "name": "supportsInterface",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4438,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4437,
                  "name": "interfaceId",
                  "nodeType": "VariableDeclaration",
                  "scope": 4447,
                  "src": "942:18:32",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes4",
                    "typeString": "bytes4"
                  },
                  "typeName": {
                    "id": 4436,
                    "name": "bytes4",
                    "nodeType": "ElementaryTypeName",
                    "src": "942:6:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "941:20:32"
            },
            "returnParameters": {
              "id": 4441,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4440,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 4447,
                  "src": "985:4:32",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 4439,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "985:4:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "984:6:32"
            },
            "scope": 4467,
            "src": "915:133:32",
            "stateMutability": "view",
            "superFunction": 4670,
            "visibility": "external"
          },
          {
            "body": {
              "id": 4465,
              "nodeType": "Block",
              "src": "1499:133:32",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "commonType": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        },
                        "id": 4455,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "leftExpression": {
                          "argumentTypes": null,
                          "id": 4453,
                          "name": "interfaceId",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 4449,
                          "src": "1517:11:32",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes4",
                            "typeString": "bytes4"
                          }
                        },
                        "nodeType": "BinaryOperation",
                        "operator": "!=",
                        "rightExpression": {
                          "argumentTypes": null,
                          "hexValue": "30786666666666666666",
                          "id": 4454,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": true,
                          "kind": "number",
                          "lValueRequested": false,
                          "nodeType": "Literal",
                          "src": "1532:10:32",
                          "subdenomination": null,
                          "typeDescriptions": {
                            "typeIdentifier": "t_rational_4294967295_by_1",
                            "typeString": "int_const 4294967295"
                          },
                          "value": "0xffffffff"
                        },
                        "src": "1517:25:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "hexValue": "4552433136353a20696e76616c696420696e74657266616365206964",
                        "id": 4456,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "string",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "1544:30:32",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_stringliteral_282912c0dfceceb28d77d0333f496b83948f9ba5b3154358a8b140b849289dee",
                          "typeString": "literal_string \"ERC165: invalid interface id\""
                        },
                        "value": "ERC165: invalid interface id"
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        },
                        {
                          "typeIdentifier": "t_stringliteral_282912c0dfceceb28d77d0333f496b83948f9ba5b3154358a8b140b849289dee",
                          "typeString": "literal_string \"ERC165: invalid interface id\""
                        }
                      ],
                      "id": 4452,
                      "name": "require",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [
                        11082,
                        11083
                      ],
                      "referencedDeclaration": 11083,
                      "src": "1509:7:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                        "typeString": "function (bool,string memory) pure"
                      }
                    },
                    "id": 4457,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "1509:66:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_tuple$__$",
                      "typeString": "tuple()"
                    }
                  },
                  "id": 4458,
                  "nodeType": "ExpressionStatement",
                  "src": "1509:66:32"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 4463,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "baseExpression": {
                        "argumentTypes": null,
                        "id": 4459,
                        "name": "_supportedInterfaces",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 4427,
                        "src": "1585:20:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
                          "typeString": "mapping(bytes4 => bool)"
                        }
                      },
                      "id": 4461,
                      "indexExpression": {
                        "argumentTypes": null,
                        "id": 4460,
                        "name": "interfaceId",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 4449,
                        "src": "1606:11:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      },
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": true,
                      "nodeType": "IndexAccess",
                      "src": "1585:33:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bool",
                        "typeString": "bool"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "hexValue": "74727565",
                      "id": 4462,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "kind": "bool",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "1621:4:32",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": "t_bool",
                        "typeString": "bool"
                      },
                      "value": "true"
                    },
                    "src": "1585:40:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "id": 4464,
                  "nodeType": "ExpressionStatement",
                  "src": "1585:40:32"
                }
              ]
            },
            "documentation": "@dev Registers the contract as an implementer of the interface defined by\n`interfaceId`. Support of the actual ERC165 interface is automatic and\nregistering its interface id is not required.\n     * See `IERC165.supportsInterface`.\n     * Requirements:\n     * - `interfaceId` cannot be the ERC165 invalid interface (`0xffffffff`).",
            "id": 4466,
            "implemented": true,
            "kind": "function",
            "modifiers": [],
            "name": "_registerInterface",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4450,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4449,
                  "name": "interfaceId",
                  "nodeType": "VariableDeclaration",
                  "scope": 4466,
                  "src": "1470:18:32",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes4",
                    "typeString": "bytes4"
                  },
                  "typeName": {
                    "id": 4448,
                    "name": "bytes4",
                    "nodeType": "ElementaryTypeName",
                    "src": "1470:6:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "1469:20:32"
            },
            "returnParameters": {
              "id": 4451,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1499:0:32"
            },
            "scope": 4467,
            "src": "1442:190:32",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 4468,
        "src": "222:1412:32"
      }
    ],
    "src": "0:1635:32"
  },
  "legacyAST": {
    "absolutePath": "/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/ERC165.sol",
    "exportedSymbols": {
      "ERC165": [
        4467
      ]
    },
    "id": 4468,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 4417,
        "literals": [
          "solidity",
          "^",
          "0.5",
          ".0"
        ],
        "nodeType": "PragmaDirective",
        "src": "0:23:32"
      },
      {
        "absolutePath": "/C/Users/socket_var/Desktop/px-bootcamp/contracts/openzeppelin-solidity/contracts/introspection/IERC165.sol",
        "file": "./IERC165.sol",
        "id": 4418,
        "nodeType": "ImportDirective",
        "scope": 4468,
        "sourceUnit": 4672,
        "src": "25:23:32",
        "symbolAliases": [],
        "unitAlias": ""
      },
      {
        "baseContracts": [
          {
            "arguments": null,
            "baseName": {
              "contractScope": null,
              "id": 4419,
              "name": "IERC165",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 4671,
              "src": "241:7:32",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_IERC165_$4671",
                "typeString": "contract IERC165"
              }
            },
            "id": 4420,
            "nodeType": "InheritanceSpecifier",
            "src": "241:7:32"
          }
        ],
        "contractDependencies": [
          4671
        ],
        "contractKind": "contract",
        "documentation": "@dev Implementation of the `IERC165` interface.\n * Contracts may inherit from this and call `_registerInterface` to declare\ntheir support of an interface.",
        "fullyImplemented": true,
        "id": 4467,
        "linearizedBaseContracts": [
          4467,
          4671
        ],
        "name": "ERC165",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "constant": true,
            "id": 4423,
            "name": "_INTERFACE_ID_ERC165",
            "nodeType": "VariableDeclaration",
            "scope": 4467,
            "src": "338:57:32",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_bytes4",
              "typeString": "bytes4"
            },
            "typeName": {
              "id": 4421,
              "name": "bytes4",
              "nodeType": "ElementaryTypeName",
              "src": "338:6:32",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes4",
                "typeString": "bytes4"
              }
            },
            "value": {
              "argumentTypes": null,
              "hexValue": "30783031666663396137",
              "id": 4422,
              "isConstant": false,
              "isLValue": false,
              "isPure": true,
              "kind": "number",
              "lValueRequested": false,
              "nodeType": "Literal",
              "src": "385:10:32",
              "subdenomination": null,
              "typeDescriptions": {
                "typeIdentifier": "t_rational_33540519_by_1",
                "typeString": "int_const 33540519"
              },
              "value": "0x01ffc9a7"
            },
            "visibility": "private"
          },
          {
            "constant": false,
            "id": 4427,
            "name": "_supportedInterfaces",
            "nodeType": "VariableDeclaration",
            "scope": 4467,
            "src": "489:52:32",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
              "typeString": "mapping(bytes4 => bool)"
            },
            "typeName": {
              "id": 4426,
              "keyType": {
                "id": 4424,
                "name": "bytes4",
                "nodeType": "ElementaryTypeName",
                "src": "497:6:32",
                "typeDescriptions": {
                  "typeIdentifier": "t_bytes4",
                  "typeString": "bytes4"
                }
              },
              "nodeType": "Mapping",
              "src": "489:23:32",
              "typeDescriptions": {
                "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
                "typeString": "mapping(bytes4 => bool)"
              },
              "valueType": {
                "id": 4425,
                "name": "bool",
                "nodeType": "ElementaryTypeName",
                "src": "507:4:32",
                "typeDescriptions": {
                  "typeIdentifier": "t_bool",
                  "typeString": "bool"
                }
              }
            },
            "value": null,
            "visibility": "private"
          },
          {
            "body": {
              "id": 4434,
              "nodeType": "Block",
              "src": "572:193:32",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 4431,
                        "name": "_INTERFACE_ID_ERC165",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 4423,
                        "src": "737:20:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      ],
                      "id": 4430,
                      "name": "_registerInterface",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 4466,
                      "src": "718:18:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_nonpayable$_t_bytes4_$returns$__$",
                        "typeString": "function (bytes4)"
                      }
                    },
                    "id": 4432,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "718:40:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_tuple$__$",
                      "typeString": "tuple()"
                    }
                  },
                  "id": 4433,
                  "nodeType": "ExpressionStatement",
                  "src": "718:40:32"
                }
              ]
            },
            "documentation": null,
            "id": 4435,
            "implemented": true,
            "kind": "constructor",
            "modifiers": [],
            "name": "",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4428,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "560:2:32"
            },
            "returnParameters": {
              "id": 4429,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "572:0:32"
            },
            "scope": 4467,
            "src": "548:217:32",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 4446,
              "nodeType": "Block",
              "src": "991:57:32",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "baseExpression": {
                      "argumentTypes": null,
                      "id": 4442,
                      "name": "_supportedInterfaces",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 4427,
                      "src": "1008:20:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
                        "typeString": "mapping(bytes4 => bool)"
                      }
                    },
                    "id": 4444,
                    "indexExpression": {
                      "argumentTypes": null,
                      "id": 4443,
                      "name": "interfaceId",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 4437,
                      "src": "1029:11:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes4",
                        "typeString": "bytes4"
                      }
                    },
                    "isConstant": false,
                    "isLValue": true,
                    "isPure": false,
                    "lValueRequested": false,
                    "nodeType": "IndexAccess",
                    "src": "1008:33:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "functionReturnParameters": 4441,
                  "id": 4445,
                  "nodeType": "Return",
                  "src": "1001:40:32"
                }
              ]
            },
            "documentation": "@dev See `IERC165.supportsInterface`.\n     * Time complexity O(1), guaranteed to always use less than 30 000 gas.",
            "id": 4447,
            "implemented": true,
            "kind": "function",
            "modifiers": [],
            "name": "supportsInterface",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4438,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4437,
                  "name": "interfaceId",
                  "nodeType": "VariableDeclaration",
                  "scope": 4447,
                  "src": "942:18:32",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes4",
                    "typeString": "bytes4"
                  },
                  "typeName": {
                    "id": 4436,
                    "name": "bytes4",
                    "nodeType": "ElementaryTypeName",
                    "src": "942:6:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "941:20:32"
            },
            "returnParameters": {
              "id": 4441,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4440,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 4447,
                  "src": "985:4:32",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 4439,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "985:4:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "984:6:32"
            },
            "scope": 4467,
            "src": "915:133:32",
            "stateMutability": "view",
            "superFunction": 4670,
            "visibility": "external"
          },
          {
            "body": {
              "id": 4465,
              "nodeType": "Block",
              "src": "1499:133:32",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "commonType": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        },
                        "id": 4455,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "leftExpression": {
                          "argumentTypes": null,
                          "id": 4453,
                          "name": "interfaceId",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 4449,
                          "src": "1517:11:32",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes4",
                            "typeString": "bytes4"
                          }
                        },
                        "nodeType": "BinaryOperation",
                        "operator": "!=",
                        "rightExpression": {
                          "argumentTypes": null,
                          "hexValue": "30786666666666666666",
                          "id": 4454,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": true,
                          "kind": "number",
                          "lValueRequested": false,
                          "nodeType": "Literal",
                          "src": "1532:10:32",
                          "subdenomination": null,
                          "typeDescriptions": {
                            "typeIdentifier": "t_rational_4294967295_by_1",
                            "typeString": "int_const 4294967295"
                          },
                          "value": "0xffffffff"
                        },
                        "src": "1517:25:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "hexValue": "4552433136353a20696e76616c696420696e74657266616365206964",
                        "id": 4456,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "string",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "1544:30:32",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_stringliteral_282912c0dfceceb28d77d0333f496b83948f9ba5b3154358a8b140b849289dee",
                          "typeString": "literal_string \"ERC165: invalid interface id\""
                        },
                        "value": "ERC165: invalid interface id"
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        },
                        {
                          "typeIdentifier": "t_stringliteral_282912c0dfceceb28d77d0333f496b83948f9ba5b3154358a8b140b849289dee",
                          "typeString": "literal_string \"ERC165: invalid interface id\""
                        }
                      ],
                      "id": 4452,
                      "name": "require",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [
                        11082,
                        11083
                      ],
                      "referencedDeclaration": 11083,
                      "src": "1509:7:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                        "typeString": "function (bool,string memory) pure"
                      }
                    },
                    "id": 4457,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "1509:66:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_tuple$__$",
                      "typeString": "tuple()"
                    }
                  },
                  "id": 4458,
                  "nodeType": "ExpressionStatement",
                  "src": "1509:66:32"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 4463,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "baseExpression": {
                        "argumentTypes": null,
                        "id": 4459,
                        "name": "_supportedInterfaces",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 4427,
                        "src": "1585:20:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_mapping$_t_bytes4_$_t_bool_$",
                          "typeString": "mapping(bytes4 => bool)"
                        }
                      },
                      "id": 4461,
                      "indexExpression": {
                        "argumentTypes": null,
                        "id": 4460,
                        "name": "interfaceId",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 4449,
                        "src": "1606:11:32",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      },
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": true,
                      "nodeType": "IndexAccess",
                      "src": "1585:33:32",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bool",
                        "typeString": "bool"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "hexValue": "74727565",
                      "id": 4462,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "kind": "bool",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "1621:4:32",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": "t_bool",
                        "typeString": "bool"
                      },
                      "value": "true"
                    },
                    "src": "1585:40:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "id": 4464,
                  "nodeType": "ExpressionStatement",
                  "src": "1585:40:32"
                }
              ]
            },
            "documentation": "@dev Registers the contract as an implementer of the interface defined by\n`interfaceId`. Support of the actual ERC165 interface is automatic and\nregistering its interface id is not required.\n     * See `IERC165.supportsInterface`.\n     * Requirements:\n     * - `interfaceId` cannot be the ERC165 invalid interface (`0xffffffff`).",
            "id": 4466,
            "implemented": true,
            "kind": "function",
            "modifiers": [],
            "name": "_registerInterface",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4450,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4449,
                  "name": "interfaceId",
                  "nodeType": "VariableDeclaration",
                  "scope": 4466,
                  "src": "1470:18:32",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes4",
                    "typeString": "bytes4"
                  },
                  "typeName": {
                    "id": 4448,
                    "name": "bytes4",
                    "nodeType": "ElementaryTypeName",
                    "src": "1470:6:32",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "1469:20:32"
            },
            "returnParameters": {
              "id": 4451,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1499:0:32"
            },
            "scope": 4467,
            "src": "1442:190:32",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 4468,
        "src": "222:1412:32"
      }
    ],
    "src": "0:1635:32"
  },
  "compiler": {
    "name": "solc",
    "version": "0.5.12+commit.7709ece9.Emscripten.clang"
  },
  "networks": {},
  "schemaVersion": "3.0.20",
  "updatedAt": "2020-02-03T11:30:43.712Z",
  "devdoc": {
    "details": "Implementation of the `IERC165` interface. * Contracts may inherit from this and call `_registerInterface` to declare their support of an interface.",
    "methods": {
      "supportsInterface(bytes4)": {
        "details": "See `IERC165.supportsInterface`.     * Time complexity O(1), guaranteed to always use less than 30 000 gas."
      }
    }
  },
  "userdoc": {
    "methods": {}
  }
}

