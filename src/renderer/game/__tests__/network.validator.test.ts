import { expect, test, describe } from "bun:test";
import { createEmptyNetwork, type NetworkState } from "../model/network";
import { validateNetwork } from "../validators/network";

describe("Network Validator", () => {
  test("empty network is valid", () => {
    const net = createEmptyNetwork();
    const errors = validateNetwork(net);
    expect(errors).toBeArrayOfSize(0);
  });

  test("detects missing nodes on tracks", () => {
    const net = createEmptyNetwork();
    net.tracks["t1"] = {
      id: "t1",
      type: "straight",
      nodes: ["n1", "n2"],
      length: 100,
      maxSpeed: 100,
    };

    const errors = validateNetwork(net);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toInclude("references non-existent node");
  });

  test("detects self-looping tracks", () => {
    const net = createEmptyNetwork();
    net.nodes["n1"] = { id: "n1", position: { x: 0, y: 0 } };
    net.tracks["t1"] = {
      id: "t1",
      type: "straight",
      nodes: ["n1", "n1"],
      length: 100,
      maxSpeed: 100,
    };

    const errors = validateNetwork(net);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toInclude("self-loop");
  });

  test("valid network returns no errors", () => {
    const net = createEmptyNetwork();
    net.nodes["n1"] = { id: "n1", position: { x: 0, y: 0 } };
    net.nodes["n2"] = { id: "n2", position: { x: 100, y: 0 } };
    net.tracks["t1"] = {
      id: "t1",
      type: "straight",
      nodes: ["n1", "n2"],
      length: 100,
      maxSpeed: 100,
    };

    const errors = validateNetwork(net);
    expect(errors).toBeArrayOfSize(0);
  });
});
