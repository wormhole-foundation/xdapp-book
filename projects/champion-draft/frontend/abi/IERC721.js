export const erc721 = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
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
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "bytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  },
  "deployedBytecode": {
    "object": "0x",
    "sourceMap": "",
    "linkReferences": {}
  },
  "methodIdentifiers": {
    "approve(address,uint256)": "095ea7b3",
    "balanceOf(address)": "70a08231",
    "getApproved(uint256)": "081812fc",
    "isApprovedForAll(address,address)": "e985e9c5",
    "ownerOf(uint256)": "6352211e",
    "safeTransferFrom(address,address,uint256)": "42842e0e",
    "safeTransferFrom(address,address,uint256,bytes)": "b88d4fde",
    "setApprovalForAll(address,bool)": "a22cb465",
    "supportsInterface(bytes4)": "01ffc9a7",
    "transferFrom(address,address,uint256)": "23b872dd"
  },
  "ast": {
    "absolutePath": "lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol",
    "id": 21139,
    "exportedSymbols": {
      "IERC165": [
        21150
      ],
      "IERC721": [
        21138
      ]
    },
    "nodeType": "SourceUnit",
    "src": "108:4640:6",
    "nodes": [
      {
        "id": 21024,
        "nodeType": "PragmaDirective",
        "src": "108:23:6",
        "literals": [
          "solidity",
          "^",
          "0.8",
          ".0"
        ]
      },
      {
        "id": 21025,
        "nodeType": "ImportDirective",
        "src": "133:47:6",
        "absolutePath": "lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol",
        "file": "../../utils/introspection/IERC165.sol",
        "nameLocation": "-1:-1:-1",
        "scope": 21139,
        "sourceUnit": 21151,
        "symbolAliases": [],
        "unitAlias": ""
      },
      {
        "id": 21138,
        "nodeType": "ContractDefinition",
        "src": "250:4497:6",
        "nodes": [
          {
            "id": 21037,
            "nodeType": "EventDefinition",
            "src": "378:82:6",
            "anonymous": false,
            "documentation": {
              "id": 21029,
              "nodeType": "StructuredDocumentation",
              "src": "285:88:6",
              "text": " @dev Emitted when `tokenId` token is transferred from `from` to `to`."
            },
            "eventSelector": "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "name": "Transfer",
            "nameLocation": "384:8:6",
            "parameters": {
              "id": 21036,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21031,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "from",
                  "nameLocation": "409:4:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21037,
                  "src": "393:20:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21030,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "393:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21033,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "to",
                  "nameLocation": "431:2:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21037,
                  "src": "415:18:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21032,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "415:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21035,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "451:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21037,
                  "src": "435:23:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21034,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "435:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "392:67:6"
            }
          },
          {
            "id": 21046,
            "nodeType": "EventDefinition",
            "src": "565:89:6",
            "anonymous": false,
            "documentation": {
              "id": 21038,
              "nodeType": "StructuredDocumentation",
              "src": "466:94:6",
              "text": " @dev Emitted when `owner` enables `approved` to manage the `tokenId` token."
            },
            "eventSelector": "8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
            "name": "Approval",
            "nameLocation": "571:8:6",
            "parameters": {
              "id": 21045,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21040,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "owner",
                  "nameLocation": "596:5:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21046,
                  "src": "580:21:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21039,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "580:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21042,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "approved",
                  "nameLocation": "619:8:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21046,
                  "src": "603:24:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21041,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "603:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21044,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "645:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21046,
                  "src": "629:23:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21043,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "629:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "579:74:6"
            }
          },
          {
            "id": 21055,
            "nodeType": "EventDefinition",
            "src": "782:85:6",
            "anonymous": false,
            "documentation": {
              "id": 21047,
              "nodeType": "StructuredDocumentation",
              "src": "660:117:6",
              "text": " @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets."
            },
            "eventSelector": "17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31",
            "name": "ApprovalForAll",
            "nameLocation": "788:14:6",
            "parameters": {
              "id": 21054,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21049,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "owner",
                  "nameLocation": "819:5:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21055,
                  "src": "803:21:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21048,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "803:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21051,
                  "indexed": true,
                  "mutability": "mutable",
                  "name": "operator",
                  "nameLocation": "842:8:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21055,
                  "src": "826:24:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21050,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "826:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21053,
                  "indexed": false,
                  "mutability": "mutable",
                  "name": "approved",
                  "nameLocation": "857:8:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21055,
                  "src": "852:13:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 21052,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "852:4:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "802:64:6"
            }
          },
          {
            "id": 21063,
            "nodeType": "FunctionDefinition",
            "src": "954:74:6",
            "documentation": {
              "id": 21056,
              "nodeType": "StructuredDocumentation",
              "src": "873:76:6",
              "text": " @dev Returns the number of tokens in ``owner``'s account."
            },
            "functionSelector": "70a08231",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "balanceOf",
            "nameLocation": "963:9:6",
            "parameters": {
              "id": 21059,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21058,
                  "mutability": "mutable",
                  "name": "owner",
                  "nameLocation": "981:5:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21063,
                  "src": "973:13:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21057,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "973:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "972:15:6"
            },
            "returnParameters": {
              "id": 21062,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21061,
                  "mutability": "mutable",
                  "name": "balance",
                  "nameLocation": "1019:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21063,
                  "src": "1011:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21060,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "1011:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "1010:17:6"
            },
            "scope": 21138,
            "stateMutability": "view",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21071,
            "nodeType": "FunctionDefinition",
            "src": "1170:72:6",
            "documentation": {
              "id": 21064,
              "nodeType": "StructuredDocumentation",
              "src": "1034:131:6",
              "text": " @dev Returns the owner of the `tokenId` token.\n Requirements:\n - `tokenId` must exist."
            },
            "functionSelector": "6352211e",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "ownerOf",
            "nameLocation": "1179:7:6",
            "parameters": {
              "id": 21067,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21066,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "1195:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21071,
                  "src": "1187:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21065,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "1187:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "1186:17:6"
            },
            "returnParameters": {
              "id": 21070,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21069,
                  "mutability": "mutable",
                  "name": "owner",
                  "nameLocation": "1235:5:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21071,
                  "src": "1227:13:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21068,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1227:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "1226:15:6"
            },
            "scope": 21138,
            "stateMutability": "view",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21083,
            "nodeType": "FunctionDefinition",
            "src": "1809:137:6",
            "documentation": {
              "id": 21072,
              "nodeType": "StructuredDocumentation",
              "src": "1248:556:6",
              "text": " @dev Safely transfers `tokenId` token from `from` to `to`.\n Requirements:\n - `from` cannot be the zero address.\n - `to` cannot be the zero address.\n - `tokenId` token must exist and be owned by `from`.\n - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.\n - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.\n Emits a {Transfer} event."
            },
            "functionSelector": "b88d4fde",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "safeTransferFrom",
            "nameLocation": "1818:16:6",
            "parameters": {
              "id": 21081,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21074,
                  "mutability": "mutable",
                  "name": "from",
                  "nameLocation": "1852:4:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21083,
                  "src": "1844:12:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21073,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1844:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21076,
                  "mutability": "mutable",
                  "name": "to",
                  "nameLocation": "1874:2:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21083,
                  "src": "1866:10:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21075,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1866:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21078,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "1894:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21083,
                  "src": "1886:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21077,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "1886:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21080,
                  "mutability": "mutable",
                  "name": "data",
                  "nameLocation": "1926:4:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21083,
                  "src": "1911:19:6",
                  "stateVariable": false,
                  "storageLocation": "calldata",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_calldata_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 21079,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "1911:5:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "1834:102:6"
            },
            "returnParameters": {
              "id": 21082,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1945:0:6"
            },
            "scope": 21138,
            "stateMutability": "nonpayable",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21093,
            "nodeType": "FunctionDefinition",
            "src": "2644:108:6",
            "documentation": {
              "id": 21084,
              "nodeType": "StructuredDocumentation",
              "src": "1952:687:6",
              "text": " @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients\n are aware of the ERC721 protocol to prevent tokens from being forever locked.\n Requirements:\n - `from` cannot be the zero address.\n - `to` cannot be the zero address.\n - `tokenId` token must exist and be owned by `from`.\n - If the caller is not `from`, it must have been allowed to move this token by either {approve} or {setApprovalForAll}.\n - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.\n Emits a {Transfer} event."
            },
            "functionSelector": "42842e0e",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "safeTransferFrom",
            "nameLocation": "2653:16:6",
            "parameters": {
              "id": 21091,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21086,
                  "mutability": "mutable",
                  "name": "from",
                  "nameLocation": "2687:4:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21093,
                  "src": "2679:12:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21085,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "2679:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21088,
                  "mutability": "mutable",
                  "name": "to",
                  "nameLocation": "2709:2:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21093,
                  "src": "2701:10:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21087,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "2701:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21090,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "2729:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21093,
                  "src": "2721:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21089,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "2721:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "2669:73:6"
            },
            "returnParameters": {
              "id": 21092,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "2751:0:6"
            },
            "scope": 21138,
            "stateMutability": "nonpayable",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21103,
            "nodeType": "FunctionDefinition",
            "src": "3267:104:6",
            "documentation": {
              "id": 21094,
              "nodeType": "StructuredDocumentation",
              "src": "2758:504:6",
              "text": " @dev Transfers `tokenId` token from `from` to `to`.\n WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.\n Requirements:\n - `from` cannot be the zero address.\n - `to` cannot be the zero address.\n - `tokenId` token must be owned by `from`.\n - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.\n Emits a {Transfer} event."
            },
            "functionSelector": "23b872dd",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "transferFrom",
            "nameLocation": "3276:12:6",
            "parameters": {
              "id": 21101,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21096,
                  "mutability": "mutable",
                  "name": "from",
                  "nameLocation": "3306:4:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21103,
                  "src": "3298:12:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21095,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "3298:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21098,
                  "mutability": "mutable",
                  "name": "to",
                  "nameLocation": "3328:2:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21103,
                  "src": "3320:10:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21097,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "3320:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21100,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "3348:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21103,
                  "src": "3340:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21099,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "3340:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "3288:73:6"
            },
            "returnParameters": {
              "id": 21102,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "3370:0:6"
            },
            "scope": 21138,
            "stateMutability": "nonpayable",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21111,
            "nodeType": "FunctionDefinition",
            "src": "3834:55:6",
            "documentation": {
              "id": 21104,
              "nodeType": "StructuredDocumentation",
              "src": "3377:452:6",
              "text": " @dev Gives permission to `to` to transfer `tokenId` token to another account.\n The approval is cleared when the token is transferred.\n Only a single account can be approved at a time, so approving the zero address clears previous approvals.\n Requirements:\n - The caller must own the token or be an approved operator.\n - `tokenId` must exist.\n Emits an {Approval} event."
            },
            "functionSelector": "095ea7b3",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "approve",
            "nameLocation": "3843:7:6",
            "parameters": {
              "id": 21109,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21106,
                  "mutability": "mutable",
                  "name": "to",
                  "nameLocation": "3859:2:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21111,
                  "src": "3851:10:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21105,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "3851:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21108,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "3871:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21111,
                  "src": "3863:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21107,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "3863:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "3850:29:6"
            },
            "returnParameters": {
              "id": 21110,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "3888:0:6"
            },
            "scope": 21138,
            "stateMutability": "nonpayable",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21119,
            "nodeType": "FunctionDefinition",
            "src": "4209:70:6",
            "documentation": {
              "id": 21112,
              "nodeType": "StructuredDocumentation",
              "src": "3895:309:6",
              "text": " @dev Approve or remove `operator` as an operator for the caller.\n Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.\n Requirements:\n - The `operator` cannot be the caller.\n Emits an {ApprovalForAll} event."
            },
            "functionSelector": "a22cb465",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "setApprovalForAll",
            "nameLocation": "4218:17:6",
            "parameters": {
              "id": 21117,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21114,
                  "mutability": "mutable",
                  "name": "operator",
                  "nameLocation": "4244:8:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21119,
                  "src": "4236:16:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21113,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "4236:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21116,
                  "mutability": "mutable",
                  "name": "_approved",
                  "nameLocation": "4259:9:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21119,
                  "src": "4254:14:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 21115,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "4254:4:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "4235:34:6"
            },
            "returnParameters": {
              "id": 21118,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "4278:0:6"
            },
            "scope": 21138,
            "stateMutability": "nonpayable",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21127,
            "nodeType": "FunctionDefinition",
            "src": "4429:79:6",
            "documentation": {
              "id": 21120,
              "nodeType": "StructuredDocumentation",
              "src": "4285:139:6",
              "text": " @dev Returns the account approved for `tokenId` token.\n Requirements:\n - `tokenId` must exist."
            },
            "functionSelector": "081812fc",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "getApproved",
            "nameLocation": "4438:11:6",
            "parameters": {
              "id": 21123,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21122,
                  "mutability": "mutable",
                  "name": "tokenId",
                  "nameLocation": "4458:7:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21127,
                  "src": "4450:15:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 21121,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "4450:7:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "4449:17:6"
            },
            "returnParameters": {
              "id": 21126,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21125,
                  "mutability": "mutable",
                  "name": "operator",
                  "nameLocation": "4498:8:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21127,
                  "src": "4490:16:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21124,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "4490:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "4489:18:6"
            },
            "scope": 21138,
            "stateMutability": "view",
            "virtual": false,
            "visibility": "external"
          },
          {
            "id": 21137,
            "nodeType": "FunctionDefinition",
            "src": "4657:88:6",
            "documentation": {
              "id": 21128,
              "nodeType": "StructuredDocumentation",
              "src": "4514:138:6",
              "text": " @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.\n See {setApprovalForAll}"
            },
            "functionSelector": "e985e9c5",
            "implemented": false,
            "kind": "function",
            "modifiers": [],
            "name": "isApprovedForAll",
            "nameLocation": "4666:16:6",
            "parameters": {
              "id": 21133,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21130,
                  "mutability": "mutable",
                  "name": "owner",
                  "nameLocation": "4691:5:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21137,
                  "src": "4683:13:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21129,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "4683:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 21132,
                  "mutability": "mutable",
                  "name": "operator",
                  "nameLocation": "4706:8:6",
                  "nodeType": "VariableDeclaration",
                  "scope": 21137,
                  "src": "4698:16:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 21131,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "4698:7:6",
                    "stateMutability": "nonpayable",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "4682:33:6"
            },
            "returnParameters": {
              "id": 21136,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 21135,
                  "mutability": "mutable",
                  "name": "",
                  "nameLocation": "-1:-1:-1",
                  "nodeType": "VariableDeclaration",
                  "scope": 21137,
                  "src": "4739:4:6",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 21134,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "4739:4:6",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "visibility": "internal"
                }
              ],
              "src": "4738:6:6"
            },
            "scope": 21138,
            "stateMutability": "view",
            "virtual": false,
            "visibility": "external"
          }
        ],
        "abstract": false,
        "baseContracts": [
          {
            "baseName": {
              "id": 21027,
              "name": "IERC165",
              "nodeType": "IdentifierPath",
              "referencedDeclaration": 21150,
              "src": "271:7:6"
            },
            "id": 21028,
            "nodeType": "InheritanceSpecifier",
            "src": "271:7:6"
          }
        ],
        "canonicalName": "IERC721",
        "contractDependencies": [],
        "contractKind": "interface",
        "documentation": {
          "id": 21026,
          "nodeType": "StructuredDocumentation",
          "src": "182:67:6",
          "text": " @dev Required interface of an ERC721 compliant contract."
        },
        "fullyImplemented": false,
        "linearizedBaseContracts": [
          21138,
          21150
        ],
        "name": "IERC721",
        "nameLocation": "260:7:6",
        "scope": 21139,
        "usedErrors": []
      }
    ],
    "license": "MIT"
  },
  "id": 6
}

