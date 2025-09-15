import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function ApiCustomResponses(responses: ApiResponseOptions[]) {
  return applyDecorators(...responses.map((r) => ApiResponse(r)));
}
