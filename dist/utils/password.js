"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareValue = exports.hashValue = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ROUNDS = 12;
const hashValue = async (value) => {
    return bcryptjs_1.default.hash(value, ROUNDS);
};
exports.hashValue = hashValue;
const compareValue = async (plain, hash) => {
    return bcryptjs_1.default.compare(plain, hash);
};
exports.compareValue = compareValue;
