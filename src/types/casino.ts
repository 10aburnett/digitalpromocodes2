export type BonusType = 'deposit' | 'free' | 'free spins' | 'cashback' | 'rakeback' | 'vip' | 'rewards' | 'crypto' | 'other';

export interface Review {
  id: string;
  username: string;
  rating: number; // 1-5
  text: string;
  date: string;
  verified: boolean;
}

export interface CasinoBonus {
  id: string;
  casinoName: string;
  bonusType: BonusType;
  bonusValue: number;
  bonusText: string;
  logoUrl: string;
  promoCode?: string;
  affiliateLink: string;
  isActive: boolean;
  reviews?: Review[];
}

export interface FilterState {
  searchTerm: string;
  bonusType: BonusType | '';
  promoType: BonusType | '';
  casino: string;
  whop: string;
  sortBy: 'highest' | 'lowest' | 'alpha-asc' | 'alpha-desc' | 'newest' | 'highest-rated' | '';
}