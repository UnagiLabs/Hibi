import { config } from "../config.js";

import type { MessageValidator } from "./message-validator.js";
import { MockMessageValidator } from "./mock-message-validator.js";

export function createMessageValidator(): MessageValidator {
  switch (config.aiProvider) {
    case "mock":
      return new MockMessageValidator();
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${config.aiProvider}`);
  }
}

