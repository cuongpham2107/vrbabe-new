import { SignJWT, jwtVerify } from 'jose'
const NEXTAUTH_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "");

const verifyToken = async (token: string) => {
  return await jwtVerify(token, NEXTAUTH_SECRET).catch(e => null)
};

const signToken = async (id: string, time = '1h') => {
  return new SignJWT({
    id: id
  })
		.setProtectedHeader({ alg: "HS256" })
    .setSubject(id)
		.setIssuedAt()
		.setExpirationTime(time)
		.sign(NEXTAUTH_SECRET)
};

export {
  verifyToken,
  signToken
}