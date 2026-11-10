import { describe, expect, it } from "vitest";
import { validateSetting, imageUploadSummary } from "@/lib/content-validation";
describe("Existing content validation", () => {
  it("rejects executable contact links", () => { expect(validateSetting("instagram", "javascript:alert(1)")).not.toBeNull(); expect(validateSetting("instagram", "https://instagram.com/igreja")).toBeNull(); });
  it("does not report a failed upload as successful", () => { expect(imageUploadSummary(0, 5)).toBe("Nenhuma foto foi enviada. Tente novamente."); expect(imageUploadSummary(2, 5)).toContain("2 de 5"); });
});