import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import { shallow } from "enzyme";
import Button from "./shared/Button";
import Adapter from "enzyme-adapter-react-16";
import Enzyme from "enzyme";
import nock from "nock";

Enzyme.configure({ adapter: new Adapter() });

test("Should render title", () => {
  render(<App />);
  const title = screen.getByText(/Rates/i);
  expect(title).toBeInTheDocument();
});

test("Should render export button", () => {
  render(<App />);
  const exportButton = screen.getByTestId("export");
  expect(exportButton).toBeInTheDocument();
});

test("Should able to click button", () => {
  render(<App />);
  const mockCallBack = jest.fn();

  const button = shallow(<Button onClick={mockCallBack}></Button>);
  button.find("button").simulate("click");
  expect(mockCallBack.mock.calls.length).toEqual(1);
});

test("Should able to click export button", async () => {
  nock("https://api.coingecko.com/api/v3/exchange_rates")
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
    })
    .get("")
    .reply(200, {
      rates: {
        btc: { name: "Bitcoin", unit: "BTC", value: 1, type: "crypto" },
      },
    });

  render(<App />);
  await new Promise((r) => setTimeout(r, 2000));
  const exportButton = screen.getByTestId("export");
  fireEvent.click(exportButton);
  expect(await screen.findByText("Exporting CSV...")).toBeInTheDocument();
});

test("checks if returned data from API rendered into component", async () => {
  nock("https://api.coingecko.com/api/v3/exchange_rates")
    .defaultReplyHeaders({
      "access-control-allow-origin": "*",
    })
    .get("")
    .reply(200, {
      rates: {
        btc: { name: "Bitcoin", unit: "BTC", value: 1, type: "crypto" },
      },
    });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText("BTC")).toBeInTheDocument();
  });
});

test("Should render search box", () => {
  render(<App />);
  const searchBox = screen.getByTestId("search");
  expect(searchBox).toBeInTheDocument();
});
