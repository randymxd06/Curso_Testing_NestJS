import { SetMetadata } from "@nestjs/common";
import { ValidRoles } from "../interfaces";
import { META_ROLES, RoleProtected } from "./role-protected.decorator";

jest.mock('@nestjs/common', () => ({
    // SetMetadata: jest.fn().mockImplementation((key, value) => ({ key, value }))
    SetMetadata: jest.fn()
}))

describe('RoleProtected Decorator', () => {

    it('should set metadata with the correct roles', () => {
        const roles = [ValidRoles.admin, ValidRoles.user];
        const result = RoleProtected(...roles);
        
        expect(SetMetadata).toHaveBeenCalled();
        expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);

        // expect(result).toEqual({
        //     key: META_ROLES,
        //     value: roles,
        // });
    });

});