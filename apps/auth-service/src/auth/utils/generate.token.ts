import * as jwt from 'jsonwebtoken'
export function generateToken(payload : object){
	const secret = process.env.JWT_KEY || 'defaultkey'
	const jwtExpires = process.env.JWT_EXPIRES_IN || "1h";
	const refreshExpires = process.env.JWT_REGRESH_EXPIRES_IN || "7d";
	const accessToken = jwt.sign(payload, secret, {expiresIn: jwtExpires});
	const refreshToken = jwt.sign(payload, secret, {expiresIn: refreshExpires});
	return {accessToken, refreshToken};
}