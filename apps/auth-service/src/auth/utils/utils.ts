import { BadRequestException } from "@nestjs/common";

export function reqFromFindUser(req: Request) {
	if (!req.headers['x-user-id'])
	  throw new BadRequestException("Header's not found x-user-id");
	return +req.headers['x-user-id'];
}