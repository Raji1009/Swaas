"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// very small mock auth controller for local testing
class AuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body || {};
            // return a mock token and user
            return res.status(200).json({
                message: 'Registered (mock)',
                token: 'mock-token-' + (email || 'user'),
                user: { id: '1', email: email || 'user@example.com' }
            });
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body || {};
            // return mock token
            return res.status(200).json({
                message: 'Logged in (mock)',
                token: 'mock-token-' + (email || 'user'),
                user: { id: '1', email: email || 'user@example.com' }
            });
        });
    }
}
exports.default = AuthController;
