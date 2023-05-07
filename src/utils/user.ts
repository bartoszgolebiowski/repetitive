import { type Session } from "next-auth"


export const extractEmailOrUserId = (session: Session) => {
    return session.user.email ?? session.user.id
}