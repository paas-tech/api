import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApiStandardResponse {
    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    message?: string;

    @ApiPropertyOptional()
    content?: any;
}
