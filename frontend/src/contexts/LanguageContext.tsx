import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'hi' | 'ta'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.bookings': 'Bookings',
    'nav.screening': 'Screening',
    'nav.resources': 'Resources',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'hero.title': 'Mental Health Support for Students',
    'hero.subtitle': 'Access professional counselling and mental health resources in a safe, stigma-free environment.',
    'hero.cta': 'Get Started',
    'features.counselling.title': 'Professional Counselling',
    'features.counselling.desc': 'Book appointments with qualified counsellors',
    'features.screening.title': 'Mental Health Screening',
    'features.screening.desc': 'Take PHQ-9 and GAD-7 assessments',
    'features.resources.title': 'Educational Resources',
    'features.resources.desc': 'Access videos, articles, and tools',
    'features.chat.title': '24/7 Support',
    'features.chat.desc': 'Chat with our AI assistant anytime',
    'footer.description': 'Supporting student mental health through technology and compassion.',
    'footer.rights': 'All rights reserved.',
  },
  hi: {
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.bookings': 'बुकिंग',
    'nav.screening': 'स्क्रीनिंग',
    'nav.resources': 'संसाधन',
    'nav.admin': 'एडमिन',
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर',
    'nav.logout': 'लॉगआउट',
    'hero.title': 'छात्रों के लिए मानसिक स्वास्थ्य सहायता',
    'hero.subtitle': 'एक सुरक्षित, कलंक-मुक्त वातावरण में पेशेवर परामर्श और मानसिक स्वास्थ्य संसाधनों तक पहुंचें।',
    'hero.cta': 'शुरू करें',
    'features.counselling.title': 'पेशेवर परामर्श',
    'features.counselling.desc': 'योग्य परामर्शदाताओं के साथ अपॉइंटमेंट बुक करें',
    'features.screening.title': 'मानसिक स्वास्थ्य स्क्रीनिंग',
    'features.screening.desc': 'PHQ-9 और GAD-7 मूल्यांकन करें',
    'features.resources.title': 'शैक्षिक संसाधन',
    'features.resources.desc': 'वीडियो, लेख और उपकरणों तक पहुंचें',
    'features.chat.title': '24/7 सहायता',
    'features.chat.desc': 'कभी भी हमारे AI सहायक से चैट करें',
    'footer.description': 'तकनीक और करुणा के माध्यम से छात्र मानसिक स्वास्थ्य का समर्थन।',
    'footer.rights': 'सभी अधिकार सुरक्षित।',
  },
  ta: {
    'nav.home': 'முகப்பு',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.bookings': 'முன்பதிவு',
    'nav.screening': 'திரையிடல்',
    'nav.resources': 'வளங்கள்',
    'nav.admin': 'நிர்வாகம்',
    'nav.login': 'உள்நுழைவு',
    'nav.register': 'பதிவு',
    'nav.logout': 'வெளியேறு',
    'hero.title': 'மாணவர்களுக்கான மனநல ஆதரவு',
    'hero.subtitle': 'பாதுகாப்பான, களங்கமற்ற சூழலில் தொழில்முறை ஆலோசனை மற்றும் மனநல வளங்களை அணுகவும்.',
    'hero.cta': 'தொடங்கவும்',
    'features.counselling.title': 'தொழில்முறை ஆலோசனை',
    'features.counselling.desc': 'தகுதிவாய்ந்த ஆலோசகர்களுடன் நேரம் பதிவு செய்யவும்',
    'features.screening.title': 'மனநல திரையிடல்',
    'features.screening.desc': 'PHQ-9 மற்றும் GAD-7 மதிப்பீடுகளை எடுக்கவும்',
    'features.resources.title': 'கல்வி வளங்கள்',
    'features.resources.desc': 'வீடியோக்கள், கட்டுரைகள் மற்றும் கருவிகளை அணுகவும்',
    'features.chat.title': '24/7 ஆதரவு',
    'features.chat.desc': 'எப்போதும் எங்கள் AI உதவியாளருடன் அரட்டை அடிக்கவும்',
    'footer.description': 'தொழில்நுட்பம் மற்றும் இரக்கத்தின் மூலம் மாணவர் மனநலத்தை ஆதரித்தல்.',
    'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
