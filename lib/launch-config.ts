import { ModuleKey } from "./roles";

// Dushanba taqdimoti uchun vaqtincha ko'rinadigan modullar ro'yxati.
// Boshqa hamma sahifa/kod saqlanib qoladi — shu ro'yxatga qo'shilsa, sidebar'da
// darhol paydo bo'ladi. Hech narsa o'chirilmaydi, faqat vaqtincha yashirilgan.
export const VISIBLE_MODULES: ModuleKey[] = ["structure", "campus", "sotuv"];
