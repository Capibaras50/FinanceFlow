"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const categories_module_1 = require("./categories/categories.module");
const transactions_module_1 = require("./transactions/transactions.module");
const wallets_module_1 = require("./wallets/wallets.module");
const bullmq_1 = require("@nestjs/bullmq");
const financial_tools_module_1 = require("./financial-tools/financial-tools.module");
const chat_module_1 = require("./chat/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    port: configService.get('PORT_DB', { infer: true }),
                    username: configService.get('USER_DB', { infer: true }),
                    password: configService.get('PASSWORD_DB', { infer: true }),
                    database: configService.get('NAME_DB', { infer: true }),
                    host: configService.get('HOST_DB', { infer: true }),
                    type: 'postgres',
                    autoLoadEntities: true,
                    synchronize: true,
                }),
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    connection: {
                        host: configService.get('HOST_QUEUE', { infer: true }),
                        port: configService.get('PORT_QUEUE', { infer: true }),
                    },
                }),
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            categories_module_1.CategoriesModule,
            transactions_module_1.TransactionsModule,
            wallets_module_1.WalletsModule,
            financial_tools_module_1.FinancialToolsModule,
            chat_module_1.ChatModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map