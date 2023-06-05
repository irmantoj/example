import nock from "nock";
import { customersService } from "./customersService";

const mockResponse = {
  id: 1,
  name: "Leanne Graham",
  username: "Bret",
  email: "Sincere@april.biz",
  address: {
    street: "Kulas Light",
    suite: "Apt. 556",
    city: "Gwenborough",
    zipcode: "92998-3874",
    geo: {
      lat: "-37.3159",
      lng: "81.1496"
    }
  },
  phone: "1-770-736-8031 x56442",
  website: "hildegard.org",
  company: {
    name: "Romaguera-Crona",
    catchPhrase: "Multi-layered client-server neural-net",
    bs: "harness real-time e-markets"
  }
}

describe("customersService", () => {
  describe("getById", () => {
    it("Should return null if customer is not found", async () => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/users/10')
        .reply(404, {});

      const customer = await customersService.getById("10");
      expect(customer).toBe(null);
    });

    it("Should return customer if customer exists found", async () => {
      nock('https://jsonplaceholder.typicode.com')
        .get('/users/10')
        .reply(200, mockResponse);

      const customer = await customersService.getById("10");
      expect(customer).toEqual({
        email: "Sincere@april.biz",
        id: "1",
        name: "Leanne Graham"
      });
    });
  });
});
