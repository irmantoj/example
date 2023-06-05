import {
  hanldePlaceAnOrder,
  hanldeAddOrderItem,
  // hanldeRemoveOrderItem,
  // handleGetOrderDetails,
} from './useCases';


const mockRepo = {
  getById: jest.fn(),
  remove: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}
const mockUsersService = {
  getById: jest.fn(),
}

describe("useCases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("hanldePlaceAnOrder", () => {
    it("should throw an error if request doesn't have order items", async () => {
      const input = {
        customerId: "1",
        orderItems: []
      }
      await expect(hanldePlaceAnOrder(input, mockRepo, mockUsersService)).rejects.toThrow('Order items cannot be empty');
    });

    it("should throw an error if customer doesn't exist", async () => {
      const input = {
        customerId: "1",
        orderItems: [
          {
            productId: "1",
            priceAmount: 123,
            currency: "EUR",
          }
        ]
      }
      mockUsersService.getById.mockResolvedValueOnce(null);
      await expect(hanldePlaceAnOrder(input, mockRepo, mockUsersService)).rejects.toThrow('Customer not found!');
    });

    it('Should throw an error if price amount lower than zero', async () => {
      const input = {
        customerId: "1",
        orderItems: [
          {
            productId: "1",
            priceAmount: -1,
            currency: "EUR",
          }
        ]
      }

      mockUsersService.getById.mockResolvedValueOnce({
        id: "1",
        name: "abc",
        email: "abc@test.com"
      });

      await expect(hanldePlaceAnOrder(input, mockRepo, mockUsersService)).rejects.toThrow('Price cannot be lower than zero');
    });

    it.each([
      {
        input: {
          customerId: "1",
          orderItems: [
            {
              productId: "1",
              priceAmount: 120,
              currency: "EUR",
            }
          ]
        },
        serviceResults: {
          email: "abc@abc.abc",
        },
        expected: {
          customerEmail: "abc@abc.abc",
          customerId: "1",
          id: "10",
          orderItems: [
            {
              id: "1",
              orderId: "10",
              price: {
                amount: 120,
                currency: "EUR",
              },
              productId: "1",
            },
          ],
        }
      },
    ])('Should create an order and return newly created order', async ({ input, serviceResults, expected }) => {

      mockUsersService.getById.mockResolvedValueOnce(serviceResults);

      mockRepo.create.mockImplementationOnce((order, orderItems) => {
        return {
          id: "10",
          customerEmail: order.customerEmail,
          customerId: order.customerId,
          orderItems: orderItems.map((entry: any) => {
            return {
              id: "1",
              orderId: "10",
              productId: entry.productId,
              price: {
                amount: entry.price.amount,
                currency: entry.price.currency
              }
            }
          })
        };
      });

      const result = await hanldePlaceAnOrder(input, mockRepo, mockUsersService);
      expect(result).toMatchObject(expected);
    });
  });

  describe("hanldeAddOrderItem", () => {
    it('Should throw an error if order not found', async () => {
      const input = {
        orderItem: {
          productId: "5",
          priceAmount: 12,
          currency: "EUR"
        },
        orderId: "10"
      }

      mockRepo.getById.mockResolvedValueOnce(null);

      await expect(hanldeAddOrderItem(input, mockRepo)).rejects.toThrow("Order not found");
    });

    it('Should throw an error if order have 5 order items', async () => {

      const input = {
        orderItem: {
          productId: "5",
          priceAmount: 12,
          currency: "EUR"
        },
        orderId: "10"
      }

      const mockOrderItem = {
        id: "1",
        orderId: "10",
        price: {
          amount: 120,
          currency: "EUR",
        },
        productId: "1",
      }

      mockRepo.getById.mockResolvedValueOnce({
        customerEmail: "abc@abc.abc",
        customerId: "1",
        id: "10",
        orderItems: [
          mockOrderItem,
          mockOrderItem,
          mockOrderItem,
          mockOrderItem,
          mockOrderItem
        ],
      });

      await expect(hanldeAddOrderItem(input, mockRepo)).rejects.toThrow("Order can't have more than 5 items");
    });

    it('Should throw an error if price amount lower than zero', async () => {
      const input = {
        orderItem: {
          productId: "5",
          priceAmount: -1,
          currency: "EUR"
        },
        orderId: "10"
      }

      const mockOrderItem = {
        id: "1",
        orderId: "10",
        price: {
          amount: 120,
          currency: "EUR",
        },
        productId: "1",
      }

      mockRepo.getById.mockResolvedValueOnce({
        customerEmail: "abc@abc.abc",
        customerId: "1",
        id: "10",
        orderItems: [mockOrderItem],
      });

      await expect(hanldeAddOrderItem(input, mockRepo)).rejects.toThrow('Price cannot be lower than zero');
    });

    it('Should add new order item', async () => {
      const input = {
        orderItem: {
          productId: "5",
          priceAmount: 120,
          currency: "EUR"
        },
        orderId: "10"
      }

      const mockOrderItem = {
        id: "1",
        orderId: "10",
        price: {
          amount: 120,
          currency: "EUR",
        },
        productId: "1",
      }

      mockRepo.getById.mockResolvedValueOnce({
        customerEmail: "abc@abc.abc",
        customerId: "1",
        id: "10",
        orderItems: [mockOrderItem],
      });


      await hanldeAddOrderItem(input, mockRepo);
      expect(mockRepo.update).toHaveBeenCalledWith({
        customerEmail: "abc@abc.abc",
        customerId: "1", "id": "10",
        orderItems: [
          {
            id: "1",
            orderId: "10",
            price: {
              amount: 120,
              currency: "EUR"
            },
            productId: "1"
          }
        ]
      }, [
        {
          id: "1",
          orderId: "10",
          price: {
            amount: 120,
            currency: "EUR"
          }, 
          productId: "1"
        },
        {
          price: {
            amount: 120,
            currency: "EUR"
          },
          productId: "5"
        }
      ]
      );
    });
  });

  // describe("hanldeRemoveOrderItem", () => {

  // });

  // describe("handleGetOrderDetails", () => {

  // });

});