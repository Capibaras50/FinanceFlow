"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEarningDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_earning_dto_1 = require("./create-earning.dto");
class UpdateEarningDto extends (0, mapped_types_1.PartialType)(create_earning_dto_1.CreateEarningDto) {
}
exports.UpdateEarningDto = UpdateEarningDto;
//# sourceMappingURL=update-earning.dto.js.map