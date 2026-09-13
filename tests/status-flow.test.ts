import { describe, expect, it } from "vitest";
import { nextStatus } from "@/components/admin/order-controls";

describe("order status flow", () => {
  it("advances delivery orders through the delivery path", () => {
    expect(nextStatus("delivery", "pending")).toBe("confirmed");
    expect(nextStatus("delivery", "baking")).toBe("out_for_delivery");
    expect(nextStatus("delivery", "out_for_delivery")).toBe("delivered");
    expect(nextStatus("delivery", "delivered")).toBeNull();
  });
  it("advances pickup orders through the pickup path", () => {
    expect(nextStatus("pickup", "baking")).toBe("ready_for_pickup");
    expect(nextStatus("pickup", "ready_for_pickup")).toBe("delivered");
  });
  it("has no next step for cancelled orders", () => {
    expect(nextStatus("delivery", "cancelled")).toBeNull();
  });
});
