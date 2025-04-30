
type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  welcome: {
    pt: "Sua opinião é muito importante para nós",
    en: "Your opinion is very important to us",
    es: "Su opinión es muy importante para nosotros"
  },
  subtitle: {
    pt: "Participe da nossa pesquisa de satisfação. São só 5 perguntas.",
    en: "Participate in our satisfaction survey. It's just 5 questions.",
    es: "Participe en nuestra encuesta de satisfacción. Son solo 5 preguntas."
  },
  scope: {
    pt: "Qual frente da Stage foi responsável pelo seu projeto:",
    en: "Which area of expertise from Stage was responsible for your project:",
    es: "¿Qué área de actuación de Stage fue responsable de tu proyecto:",
  },
  start: {
    pt: "Iniciar",
    en: "Start",
    es: "Comenzar"
  },
  question1: {
    pt: "Qual a probabilidade de você recomendar a Stage Consulting para um amigo, colega, ou outra empresa?",
    en: "How likely are you to recommend Stage Consulting to a friend, colleague, or another company?",
    es: "¿Cuál es la probabilidad de que recomiende Stage Consulting a un amigo, colega u otra empresa?"
  },
  lowProbability: {
    pt: "1 - Pouco provável",
    en: "1 - Not likely",
    es: "1 - Poco probable"
  },
  highProbability: {
    pt: "10 - Muito provável",
    en: "10 - Very likely",
    es: "10 - Muy probable"
  },
  question2: {
    pt: "Qual o principal motivo por ter dado essa nota?",
    en: "What is the main reason for giving this score?",
    es: "¿Cuál es la razón principal para dar esta puntuación?"
  },
  question3: {
    pt: "Qual a probabilidade de você recontratar um novo serviço da Stage Consulting?",
    en: "How likely are you to hire a new service from Stage Consulting?",
    es: "¿Cuál es la probabilidad de que contrate un nuevo servicio de Stage Consulting?"
  },
  question4: {
    pt: "Deixe o seu depoimento sobre como foi trabalhar com a Stage",
    en: "Leave your testimonial about your experience working with Stage",
    es: "Deje su testimonio sobre cómo fue trabajar con Stage"
  },
  question5: {
    pt: "Obrigado pelo seu depoimento! Podemos publicá-lo em nossas redes sociais e/ou no nosso site?",
    en: "Thank you for your testimonial! Can we publish it on our social media and/or website?",
    es: "¡Gracias por su testimonio! ¿Podemos publicarlo en nuestras redes sociales y/o sitio web?"
  },
  yes: {
    pt: "Sim",
    en: "Yes",
    es: "Sí"
  },
  no: {
    pt: "Não",
    en: "No",
    es: "No"
  },
  seeAnswers: {
    pt: "Ver respostas",
    en: "See answers",
    es: "Ver respuestas"
  },
  sendAnswers: {
    pt: "Enviar respostas",
    en: "Send answers",
    es: "Enviar respuestas"
  },
  yourAnswers: {
    pt: "Suas respostas",
    en: "Your answers",
    es: "Sus respuestas"
  },
  thankYou: {
    pt: "Obrigado por participar!",
    en: "Thank you for participating!",
    es: "¡Gracias por participar!"
  },
  thankYouSubtitle: {
    pt: "Sua opinião é muito importante para nós.",
    en: "Your opinion is very important to us.",
    es: "Su opinión es muy importante para nosotros."
  },
  learnMore: {
    pt: "Ver mais sobre a Stage",
    en: "Learn more about Stage",
    es: "Ver más sobre Stage"
  },
  enterCode: {
    pt: "Digite seu código",
    en: "Enter your code",
    es: "Ingrese su código"
  },
  continue: {
    pt: "Continuar",
    en: "Continue",
    es: "Continuar"
  },
  codeError: {
    pt: "Código inválido. Por favor, tente novamente.",
    en: "Invalid code. Please try again.",
    es: "Código no válido. Por favor, inténtelo de nuevo."
  },
  next: {
    pt: "Próximo",
    en: "Next",
    es: "Siguiente"
  },
  back: {
    pt: "Voltar",
    en: "Back",
    es: "Atrás"
  },
  invalidCode: {
    pt: "Código inválido",
    en: "Invalid code",
    es: "Código no válido"
  },
  chooseLanguage: {
    pt: "Escolha o idioma",
    en: "Choose language",
    es: "Elija el idioma"
  },
  login: {
    pt: "Entrar",
    en: "Login",
    es: "Iniciar sesión"
  },
  password: {
    pt: "Senha",
    en: "Password",
    es: "Contraseña"
  },
  email: {
    pt: "Email",
    en: "Email",
    es: "Email"
  },
  adminArea: {
    pt: "Área do Administrador",
    en: "Admin Area",
    es: "Área de Administrador"
  },
  summary: {
    pt: "Suas Respostas",
    en: "Your answers",
    es: "Sus respuestas"
  },
};

export type Language = "pt" | "en" | "es";

export const getTranslation = (key: string, language: Language): string => {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  return translations[key][language] || translations[key]["en"];
};
