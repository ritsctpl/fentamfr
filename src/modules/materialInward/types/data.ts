const data={
  "biscuitManufacturing": {
    "operations": [
      {
        "operationId": "UUID1",
        "operationName": "Mixing",
        "description": "Combining all ingredients.",
        "duration": "30 minutes",
        "sequence": 1,
        "equipment": [
          {
            "equipmentId": "EQ1",
            "equipmentName": "Mixing Machine",
            "capacity": "200 kg"
          }
        ]
      },
      {
        "operationId": "UUID2",
        "operationName": "Baking",
        "description": "Baking the mixed dough.",
        "duration": "15 minutes",
        "sequence": 2,
        "equipment": [
          {
            "equipmentId": "EQ2",
            "equipmentName": "Baking Oven",
            "capacity": "100 trays"
          }
        ]
      },
      {
        "operationId": "UUID3",
        "operationName": "Cooling",
        "description": "Cooling the baked biscuits.",
        "duration": "20 minutes",
        "sequence": 3,
        "equipment": [
          {
            "equipmentId": "EQ3",
            "equipmentName": "Cooling Rack",
            "capacity": "200 kg"
          }
        ]
      },
      {
        "operationId": "UUID4",
        "operationName": "Packaging",
        "description": "Packing biscuits into boxes.",
        "duration": "10 minutes",
        "sequence": 4,
        "equipment": [
          {
            "equipmentId": "EQ4",
            "equipmentName": "Packing Machine",
            "capacity": "300 boxes/hour"
          }
        ]
      }
    ],
    "ingredients": [
      {
        "ingredientId": "ING1",
        "ingredientName": "Flour",
        "quantity": "100 kg",
        "supplier": "Supplier A"
      },
      {
        "ingredientId": "ING2",
        "ingredientName": "Sugar",
        "quantity": "50 kg",
        "supplier": "Supplier B"
      },
      {
        "ingredientId": "ING3",
        "ingredientName": "Butter",
        "quantity": "25 kg",
        "supplier": "Supplier C"
      },
      {
        "ingredientId": "ING4",
        "ingredientName": "Chocolate Chips",
        "quantity": "10 kg",
        "supplier": "Supplier D"
      }
    ],
    "products": [
      {
        "productId": "PROD1",
        "productName": "Chocolate Biscuit",
        "description": "Delicious chocolate-flavored biscuit.",
        "operationRouting": [
          {
            "operationId": "UUID1",
            "sequence": 1
          },
          {
            "operationId": "UUID2",
            "sequence": 2
          },
          {
            "operationId": "UUID3",
            "sequence": 3
          },
          {
            "operationId": "UUID4",
            "sequence": 4
          }
        ]
      },
      {
        "productId": "PROD2",
        "productName": "Butter Biscuit",
        "description": "Rich and buttery flavor.",
        "operationRouting": [
          {
            "operationId": "UUID1",
            "sequence": 1
          },
          {
            "operationId": "UUID2",
            "sequence": 2
          },
          {
            "operationId": "UUID3",
            "sequence": 3
          },
          {
            "operationId": "UUID4",
            "sequence": 4
          }
        ]
      }
    ]
  }
}

const data2 = {
  "routing": [
    {
      "productId": "PROD1",
      "productName": "Chocolate Biscuit",
      "operations": [
        {
          "operationId": "UUID1",
          "operationName": "Mixing",
          "sequence": 1,
          "duration": "30 minutes",
          "equipment": [
            {
              "equipmentId": "EQ1",
              "equipmentName": "Mixing Machine",
              "capacity": "200 kg"
            }
          ]
        },
        {
          "operationId": "UUID2",
          "operationName": "Baking",
          "sequence": 2,
          "duration": "15 minutes",
          "equipment": [
            {
              "equipmentId": "EQ2",
              "equipmentName": "Baking Oven",
              "capacity": "100 trays"
            }
          ]
        },
        {
          "operationId": "UUID3",
          "operationName": "Cooling",
          "sequence": 3,
          "duration": "20 minutes",
          "equipment": [
            {
              "equipmentId": "EQ3",
              "equipmentName": "Cooling Rack",
              "capacity": "200 kg"
            }
          ]
        },
        {
          "operationId": "UUID4",
          "operationName": "Packaging",
          "sequence": 4,
          "duration": "10 minutes",
          "equipment": [
            {
              "equipmentId": "EQ4",
              "equipmentName": "Packing Machine",
              "capacity": "300 boxes/hour"
            }
          ]
        }
      ]
    },
    {
      "productId": "PROD2",
      "productName": "Butter Biscuit",
      "operations": [
        {
          "operationId": "UUID1",
          "operationName": "Mixing",
          "sequence": 1,
          "duration": "30 minutes",
          "equipment": [
            {
              "equipmentId": "EQ1",
              "equipmentName": "Mixing Machine",
              "capacity": "200 kg"
            }
          ]
        },
        {
          "operationId": "UUID2",
          "operationName": "Baking",
          "sequence": 2,
          "duration": "15 minutes",
          "equipment": [
            {
              "equipmentId": "EQ2",
              "equipmentName": "Baking Oven",
              "capacity": "100 trays"
            }
          ]
        },
        {
          "operationId": "UUID3",
          "operationName": "Cooling",
          "sequence": 3,
          "duration": "20 minutes",
          "equipment": [
            {
              "equipmentId": "EQ3",
              "equipmentName": "Cooling Rack",
              "capacity": "200 kg"
            }
          ]
        },
        {
          "operationId": "UUID4",
          "operationName": "Packaging",
          "sequence": 4,
          "duration": "10 minutes",
          "equipment": [
            {
              "equipmentId": "EQ4",
              "equipmentName": "Packing Machine",
              "capacity": "300 boxes/hour"
            }
          ]
        }
      ]
    }
  ]
}
