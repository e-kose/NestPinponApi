import { HttpException, InternalServerErrorException } from "@nestjs/common";

export function catchErrorFunction(error: any) {
  if (error.response && error.response.data) {
    throw new HttpException(
      {
        success: false,
        message: error.response.data.message,
      },
      error.response.status || 400,
    );
  }
  throw new InternalServerErrorException('User service bağlantı hatası');
}
