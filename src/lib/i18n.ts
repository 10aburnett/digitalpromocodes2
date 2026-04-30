export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  nl: { name: 'Nederlands', flag: '🇳🇱' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  zh: { name: '中文', flag: '🇨🇳' }
};

export const languageKeys = Object.keys(languages) as Language[];

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'en';

export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Deals, Coupons & Discounts',
    'home.subtitle': 'Discover exclusive promo codes and deals for the best digital products',
    'home.cta': 'Explore Offers',
    'home.filterCodes': 'Filter Products',
    'home.featured': 'Featured Deals',
    'home.statistics': 'Platform Statistics',
    'home.noResults': 'No promo codes found matching your filters. Try changing your filter criteria.',
    'home.expertReviews': 'Expert Reviews',
    'home.expertReviewsDesc': 'Our team thoroughly tests each digital product and promo code to ensure you get the best deals with genuine value and access.',
    'home.exclusiveAccess': 'Special access',
    'home.exclusiveAccessDesc': 'Get special promo codes and exclusive discounts that you won\'t find anywhere else, negotiated exclusively for our community.',
    'home.alwaysUpdated': 'Always Updated',
    'home.alwaysUpdatedDesc': 'Our promo code database is updated daily to ensure all offers are current, active, and provide maximum value to users.',
    'home.readyToSave': 'Find a deal that works for you? Explore our curated offers above and unlock savings today.',
    
    // Statistics
    'stats.users': 'People using the platform',
    'stats.whops': 'Live offers',
    'stats.codes': 'Available codes',
    'stats.claimed': 'Codes used',
    'stats.popular': 'Most frequently clicked',
    
    // Whop Cards
    'whop.viewDeal': 'Redeem Promo',
    'whop.revealCode': 'Reveal Code',
    'whop.goToOffer': 'Go to Offer',
    'whop.noCodeDisclosure': 'No code required – offer applied automatically',
    'whop.noCode': 'Creator doesn\'t allow promo codes at this time',
    'whop.yourCode': 'Your code',
    'whop.offerOpenedInTab': 'Offer opened in new tab',
    'whop.codeCopied': 'Code copied!',
    'whop.getPromo': 'Go to Course',
    
    // Whop Page
    'whop.promoCode': 'Discount code',
    'whop.howToRedeem': 'How to redeem this offer',
    'whop.productDetails': 'Offer details',
    'whop.about': 'Overview',
    'whop.promoDetails': 'Promotion details',
    'whop.termsConditions': 'Key terms & conditions',
    'whop.faq': 'Common questions',
    'whop.website': 'Visit website',
    'whop.discountValue': 'Savings amount',
    'whop.price': 'Current price',
    'whop.category': 'Service category',
    'whop.offer': 'OFFER DETAILS',
    'whop.discount': 'DISCOUNT INFO',
    'whop.noPromoAvailable': 'No active promotion available',
    'whop.varies': 'Varies by offer',
    
    // How to Redeem Steps
    'whop.step1': 'Select the "{button}" button to go to {name}',
    'whop.step2Code': 'Copy the code once it is shown',
    'whop.step2NoCode': 'No code is required – the discount will be applied automatically',
    'whop.step3': 'Finish your sign-up or checkout',
    'whop.step4': 'Start using your {promo}',
    
    // FAQ
    'whop.faqQ1': 'How do I apply this {name} promo?',
    'whop.faqA1': 'To apply the {promo} for {name}, click the "{button}" button above.',
    'whop.faqA1Code': ' Copy the code and paste it at checkout.',
    'whop.faqA1NoCode': ' The discount will be applied automatically when you follow the link.',
    'whop.faqQ2': 'What kind of service is {name}?',
    'whop.faqA2': '{name} offers {category} focused solutions for its users.',
    'whop.faqA2Category': 'in the {category} space and provides',
    'whop.faqA2NoCategory': 'a specialised service that provides',
    'whop.faqQ3': 'How long does this promo remain valid?',
    'whop.faqA3': 'Promo duration can vary. Please refer to {name}\'s website for the latest information on expiry dates and applicable terms.',
    
    // Terms & Conditions
    'whop.termsText': 'This {offer} applies to {name} and is governed by their own terms and conditions. The discount may be limited by time or availability. Please review {name}\'s website for the most up-to-date terms.',
    'whop.termsOffer': 'discount code "{code}"',
    'whop.termsOfferNoCode': 'promotion',
    
    // Footer
    'footer.description': 'A focused place to discover digital discounts, coupons and online savings opportunities.',
    'footer.quickLinks': 'Shortcuts',
    'footer.legal': 'Legal information',
    'footer.privacy': 'Privacy notice',
    'footer.terms': 'Terms of use',
    'footer.rights': 'All rights reserved for this site.',
    
    // Legal Pages
    'legal.backToHome': 'Back to Home',
    'legal.lastUpdated': 'Last updated',
    
    // Privacy Policy Content
    'privacy.title': 'Privacy Policy',
    'privacy.introduction.title': 'Introduction',
    'privacy.introduction.content': 'Digital Promo Codes ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website digitalpromocodes.com and use our services.',
    'privacy.infoCollect.title': 'Information We Collect',
    'privacy.infoProvide.title': 'Information You Provide',
    'privacy.infoProvide.content': 'Contact information when you reach out to us\nFeedback and comments you submit\nNewsletter subscription information',
    'privacy.infoAuto.title': 'Information Automatically Collected',
    'privacy.infoAuto.content': 'Browser type and version\nDevice information\nPages visited and time spent on our site\nReferring website information\nCookies and similar tracking technologies',
    'privacy.howUse.title': 'How We Use Your Information',
    'privacy.howUse.content': 'Provide Services: To operate and maintain our website and provide whop product information\nImprove Experience: To analyze usage patterns and improve our content and user experience\nCommunication: To respond to your inquiries and send important updates\nAnalytics: To track website performance and user engagement\nLegal Compliance: To comply with applicable laws and regulations',
    'privacy.sharing.title': 'Information Sharing',
    'privacy.sharing.content': 'We do not sell, trade, or rent your personal information. We may share information in the following circumstances:\n\nAffiliate Partners: When you click on whop links, you may be redirected to our affiliate partners\nService Providers: With trusted third-party services that help us operate our website\nLegal Requirements: When required by law or to protect our rights\nBusiness Transfers: In connection with a merger, sale, or transfer of assets',
    'privacy.cookies.title': 'Cookies and Tracking',
    'privacy.cookies.content': 'We use cookies and similar technologies to:\n\nRemember your preferences\nAnalyze website traffic and usage\nProvide personalized content\nTrack affiliate referrals\n\nYou can control cookies through your browser settings, but disabling them may affect website functionality.',
    'privacy.security.title': 'Data Security',
    'privacy.security.content': 'We implement appropriate security measures to protect your information, including:\n\nSSL encryption for data transmission\nSecure hosting infrastructure\nRegular security updates and monitoring\nLimited access to personal information',
    'privacy.rights.title': 'Your Rights',
    'privacy.rights.content': 'You have the right to:\n\nAccess your personal information\nCorrect inaccurate information\nRequest deletion of your information\nOpt-out of marketing communications\nObject to processing of your information',
    'privacy.contact.title': 'Contact Us',
    'privacy.contact.content': 'If you have any questions about this Privacy Policy or our data practices, please contact us:<br><br>Email: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Website: <a href="/contact">Contact Form</a>',
    
    // Terms of Service Content
    'terms.title': 'Terms of Service',
    'terms.agreement.title': 'Agreement to Terms',
    'terms.agreement.content': 'By accessing and using Digital Promo Codes ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
    'terms.license.title': 'Use License',
    'terms.license.content': 'Permission is granted to temporarily download one copy of the materials on Digital Promo Codes for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n\nModify or copy the materials\nUse the materials for any commercial purpose or for any public display\nAttempt to reverse engineer any software contained on the website\nRemove any copyright or other proprietary notations from the materials',
    'terms.disclaimer.title': 'Disclaimer',
    'terms.disclaimer.content': 'Information Accuracy: The materials on Digital Promo Codes are provided on an \'as is\' basis. We make no warranties, expressed or implied.\nThird-Party Services: We are not responsible for the content, policies, or practices of third-party websites that we link to.\nPromotion Availability: Promotions and discounts are subject to change without notice. We do not guarantee the availability or terms of any promotional offers.',
    'terms.responsible.title': 'Responsible Use',
    'terms.responsible.content': 'Digital Promo Codes promotes responsible use of digital products and services. We encourage users to:\n\nOnly purchase products and services you can afford\nResearch products thoroughly before purchasing\nRead terms and conditions of whop products carefully\nContact whop providers directly for product support\n\nIf you have concerns about any whop product or service, please contact the provider directly or reach out to us through our contact form.',
    'terms.contactInfo.title': 'Contact Information',
    'terms.contactInfo.content': 'If you have any questions about these Terms of Service, please contact us:<br><br>Email: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Website: <a href="/contact">Contact Form</a>',
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Have a question or suggestion? Reach out below.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Submit',
    'contact.sendMessage': 'Write to us',
    'contact.getInTouch': 'Other ways to connect',
    'contact.backToHome': 'Return home',
    'contact.faqTitle': 'Quick answers',
    'contact.faq1Question': 'How do I use a code?',
    'contact.faq1Answer': 'Click the button next to the code to visit the product page, then enter the code at checkout.',
    'contact.faq2Question': 'Are these codes verified?',
    'contact.faq2Answer': 'We review codes before listing them and update the catalogue regularly to remove outdated entries.',
    'contact.faq3Question': 'Can you help with product issues?',
    'contact.faq3Answer': 'We only list promo codes. For account or payment problems, please contact the product provider directly.',
    'contact.successMessage': 'Your message has been sent. We\'ll reply as soon as we can.',
    'contact.errorMessage': 'Something went wrong. Please try again or email us directly.',
    'contact.emailSupport': 'Email',
    'contact.emailSupportDesc': 'General questions and feedback',
    'contact.businessInquiries': 'Partnerships',
    'contact.businessInquiriesDesc': 'Collaborations and business enquiries',
    'contact.responseTime': 'Typical reply time',
    'contact.responseTimeDesc': 'Within 24 hours on weekdays',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Códigos de Descuento, Cupones y Descuentos',
    'home.subtitle': 'Descubre códigos promocionales exclusivos y ofertas para los mejores productos digitales',
    'home.cta': 'Ver Ofertas',
    'home.filterCodes': 'Filtrar Códigos',
    'home.featured': 'Ofertas Destacadas',
    'home.statistics': 'Estadísticas de la Plataforma',
    'home.noResults': 'No se encontraron códigos promocionales que coincidan con tus filtros. Intenta cambiar tus criterios de filtro.',
    'home.expertReviews': 'Reseñas de Expertos',
    'home.expertReviewsDesc': 'Nuestro equipo prueba minuciosamente cada producto digital y código promocional para asegurar que obtengas las mejores ofertas con valor genuino y acceso.',
    'home.exclusiveAccess': 'Acceso Exclusivo',
    'home.exclusiveAccessDesc': 'Obtén códigos promocionales especiales y descuentos exclusivos que no encontrarás en ningún otro lugar, negociados exclusivamente para nuestra comunidad.',
    'home.alwaysUpdated': 'Siempre Actualizado',
    'home.alwaysUpdatedDesc': 'Nuestra base de datos de códigos promocionales se actualiza diariamente para asegurar que todas las ofertas sean actuales, activas y proporcionen el máximo valor a los usuarios.',
    'home.readyToSave': '¿Listo para ahorrar dinero? Navega nuestros productos mejor calificados arriba y comienza a acceder a contenido premium hoy.',
    
    // Statistics
    'stats.users': 'Usuarios Totales',
    'stats.whops': 'Ofertas Activas',
    'stats.codes': 'Códigos Promocionales',
    'stats.claimed': 'Códigos Promocionales Canjeados',
    'stats.popular': 'Más Popular',
    
    // Whop Cards
    'whop.viewDeal': 'Canjear Promo',
    'whop.revealCode': 'Revelar Código',
    'whop.goToOffer': 'Ir a la Oferta',
    'whop.noCodeDisclosure': 'No se requiere código – la oferta se aplica automáticamente',
    'whop.noCode': 'El creador no permite códigos promocionales en este momento',
    'whop.yourCode': 'Tu código',
    'whop.offerOpenedInTab': 'Oferta abierta en nueva pestaña',
    'whop.codeCopied': '¡Código copiado!',
    'whop.getPromo': 'Ir al Curso',
    
    // Whop Page
    'whop.promoCode': 'Código de Promoción',
    'whop.howToRedeem': 'Cómo Canjear',
    'whop.productDetails': 'Detalles del Producto',
    'whop.about': 'Acerca de',
    'whop.promoDetails': 'Detalles de la Promoción',
    'whop.termsConditions': 'Términos y Condiciones',
    'whop.faq': 'Preguntas Frecuentes',
    'whop.website': 'Sitio Web',
    'whop.discountValue': 'Valor de Descuento',
    'whop.price': 'Precio',
    'whop.category': 'Categoría',
    'whop.offer': 'OFERTA',
    'whop.discount': 'DESCUENTO',
    'whop.noPromoAvailable': 'No hay promociones disponibles',
    'whop.varies': 'Varía',
    
    // How to Redeem Steps
    'whop.step1': 'Haz clic en el botón "{button}" para acceder a {name}',
    'whop.step2Code': 'Copia el código promocional revelado',
    'whop.step2NoCode': 'No se requiere código - el descuento se aplicará automáticamente',
    'whop.step3': 'Completa tu registro o compra',
    'whop.step4': '¡Disfruta tu {promo}!',
    
    // FAQ 
    'whop.faqQ1': '¿Cómo uso este código promocional de {name}?',
    'whop.faqA1': 'Para usar la promoción {promo} para {name}, haz clic en el botón "{button}" arriba.',
    'whop.faqA1Code': ' Copia el código y pégalo durante el checkout.',
    'whop.faqA1NoCode': ' El descuento se aplicará automáticamente cuando accedes al enlace.',
    'whop.faqQ2': '¿Qué tipo de servicio es {name}?',
    'whop.faqA2': '{name} es {category} soluciones especializadas para sus usuarios.',
    'whop.faqA2Category': 'en la categoría {category} y proporciona',
    'whop.faqA2NoCategory': 'un servicio exclusivo que proporciona',
    'whop.faqQ3': '¿Por cuánto tiempo es válido este descuento?',
    'whop.faqA3': 'La validez de la promoción varía. Por favor, consulta el sitio web de {name} para la información más actualizada sobre fechas de vencimiento y términos.',
    
    // Terms & Conditions
    'whop.termsText': 'Este {oferta} es válido para {name} y está sujeto a sus terminos y condiciones. El descuento puede estar limitado en tiempo y disponibilidad. Por favor, consulte el sitio web de {name} para los términos y condiciones más actuales.',
    'whop.termsOffer': 'código promocional "{code}"',
    'whop.termsOfferNoCode': 'oferta',
    
    // Footer
    'footer.description': 'Tu fuente confiable para promociones premium de productos digitales y ofertas exclusivas.',
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.legal': 'Legal',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servizio',
    'footer.rights': 'Todos los derechos reservados.',
    
    // Legal Pages
    'legal.backToHome': 'Volver a Inicio',
    'legal.lastUpdated': 'Actualizado',
    
    // Privacy Policy Content
    'privacy.title': 'Política de Privacidad',
    'privacy.introduction.title': 'Introducción',
    'privacy.introduction.content': 'Digital Promo Codes ("nosotros," "nuestro," o "nosotros") se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulghiamos y protegemos su información cuando visita nuestro sitio web example.com y utiliza nuestros servicios.',
    'privacy.infoCollect.title': 'Información que Recopilamos',
    'privacy.infoProvide.title': 'Información que Nos Proporciona',
    'privacy.infoProvide.content': 'Información de contacto cuando nos contacta\nComentarios y sugerencias que nos envía\nInformación de suscripción a boletines informativo',
    'privacy.infoAuto.title': 'Información Automáticamente Recopilada',
    'privacy.infoAuto.content': 'Tipo y versión del navegador\nInformación del dispositivo\nPáginas visitadas y tiempo que pasa en nuestro sitio\nInformaziones del sitio web de referencia\nCokies y tecnologías de seguimiento similares',
    'privacy.howUse.title': 'Cómo Utilizamos Su Información',
    'privacy.howUse.content': 'Proporcionar Servicios: Para operar y mantener nuestro sitio web y proporcionar información sobre productos\nMejorar Experiencia: Para analizar patrones de uso y mejorar nuestro contenido y experiencia de usuario\nComunicación: Para responder a sus consultas y enviar actualizaciones importantes\nAnalítica: Para rastrear el rendimiento del sitio web y la participación del usuario\nCumplimiento Legal: Para cumplir con las leyes y regulaciones aplicables',
    'privacy.sharing.title': 'Compartir Información',
    'privacy.sharing.content': 'No vendiamos, intercambiamos o noleggiamo las tús informaciones personales. Podemos compartir información en las siguientes circunstancias:\n\nAffiliate Partners: Cuando haga clic en enlaces whop, puede ser redirigido a nuestros socios afiliados\nService Providers: Con servicios de terceros de confianza que nos ayudan a operar nuestro sitio web\nLegal Requirements: Cuando se requiere por ley o para proteger nuestros derechos\nBusiness Transfers: En conexión con una fusión, venta o transferencia de activos',
    'privacy.cookies.title': 'Cookies y Seguimiento',
    'privacy.cookies.content': 'Utilizamos cookies y tecnologías similares para:\n\nRecordar sus preferencias\nAnalizar el tráfico del sitio web y su uso\nProporcionar contenido personalizado\nSeguimiento de afiliados\n\nPuede controlar los cookies a través de la configuración del navegador, pero deshabilitarlos puede afectar la funcionalidad del sitio web.',
    'privacy.security.title': 'Seguridad de Datos',
    'privacy.security.content': 'Implementamos medidas de seguridad adecuadas para proteger su información, incluyendo:\n\nSSL encryption for data transmission\nSecure hosting infrastructure\nRegular security updates and monitoring\nLimited access to personal information',
    'privacy.rights.title': 'Sus Derechos',
    'privacy.rights.content': 'Tiene el derecho de:\n\nAcceder a su información personal\nCorregir información inexacta\nSolicitar la eliminación de su información\nOpcionar la no participación en comunicaciones de marketing\nObjetar el procesamiento de su información',
    'privacy.contact.title': 'Contáctenos',
    'privacy.contact.content': 'Si tiene alguna pregunta sobre esta Política de Privacidad o nuestras prácticas de datos, por favor contáctenos:<br><br>Correo electrónico: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Sitio web: <a href="/es/contact">Formulario de Contacto</a>',
    
    // Terms of Service Content
    'terms.title': 'Términos de Servizio',
    'terms.agreement.title': 'Acuerdo de Términos',
    'terms.agreement.content': 'Al acceder y utilizar Digital Promo Codes ("nosotros," "nuestro," o "nosotros"), acepta y acepta estar sujeto a los términos y disposición de este acuerdo. Si no está de acuerdo con lo anterior, por favor no utilice este servicio.',
    'terms.license.title': 'Licencia de Uso',
    'terms.license.content': 'Se otorga permiso para descargar temporalmente una copia de los materiales en Digital Promo Codes solo para visualización transitoria personal, no comercial. Este es el otorgamiento de una licencia, no una transferencia de título, y bajo esta licencia no puede:\n\nModificar o copiar los materiales\nUsar los materiales para cualquier propósito comercial o para cualquier exhibición pública\nIntentar invertir ingeniería de software contenido en el sitio web\nEliminar cualquier notación de propiedad intelectual o cualquier otra',
    'terms.disclaimer.title': 'Renuncia',
    'terms.disclaimer.content': 'Precisión de la Información: Los materiales en Digital Promo Codes se proporcionan en base "tal cual". No hacemos ninguna garantía, expresa o implícita.\nServicios de Terceros: No somos responsables del contenido, políticas o prácticas de sitios web whop terceros a los que enlazamos.\nDisponibilità delle Promozioni: Le promozioni e gli sconti whop sono basati su modifiche senza preavviso. Non garantiamo la disponibilità o i termini di qualsiasi offerta promozionale.',
    'terms.responsible.title': 'Uso Responsable',
    'terms.responsible.content': 'Digital Promo Codes promueve el uso responsable de productos y servicios digitales. Nosotros animamos a los usuarios a:\n\nSolo comprar productos y servicios que puedan pagar\nInvestigar productos minuciosamente antes de comprar\nLeer cuidadosamente los términos y condiciones de los productos whop\nContactar directamente con los proveedores de whop para product support\n\nSi tiene alguna preocupación sobre cualquier producto o servicio whop, por favor contáctese directamente con el proveedor o comuníquese con nosotros a través del formulario de contacto.',
    'terms.contactInfo.title': 'Contacto',
    'terms.contactInfo.content': 'Si tiene alguna pregunta sobre estos Términos de Servicio, por favor contáctenos:<br><br>Correo electrónico: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Sitio web: <a href="/es/contact">Formulario de Contacto</a>',
    
    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Ponte en contacto con nuestro equipo',
    'contact.name': 'Nombre',
    'contact.email': 'Correo Electrónico',
    'contact.subject': 'Asunto',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar Mensaje',
    'contact.sendMessage': 'Envíanos un Mensaje',
    'contact.getInTouch': 'Ponte en Contacto',
    'contact.backToHome': 'Volver a Inicio',
    'contact.faqTitle': 'Preguntas Frecuentes',
    'contact.faq1Question': '¿Cómo puedo reclamar una promoción?',
    'contact.faq1Answer': 'Haz clic en el botón "Obtener Promoción" de cualquier tarjeta whop para ser redirigido al whop. Siga su proceso de registro y usa cualquier código promocional proporcionado.',
    'contact.faq2Question': '¿Son legítimas estas promociones?',
    'contact.faq2Answer': 'Sí, solo presentamos promociones de whops verificados y respetables. Todas las ofertas se verifican y actualizan regularmente.',
    'contact.faq3Question': '¿Ofrecen soporte al cliente para problemas con whop?',
    'contact.faq3Answer': 'Proporcionamos información sobre promos, pero para problemas de cuenta o producto, necesitarás contactar directamente con el whop.',
    'contact.successMessage': '¡Gracias por tu mensaje! Te responderemos dentro de 24 horas.',
    'contact.errorMessage': 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente.',
    'contact.emailSupport': 'Soporte por Email',
    'contact.emailSupportDesc': 'Para consultas generales y soporte',
    'contact.businessInquiries': 'Consultas Comerciales',
    'contact.businessInquiriesDesc': 'Para asociaciones y oportunidades comerciales',
    'contact.responseTime': 'Tiempo de Respuesta',
    'contact.responseTimeDesc': 'Típicamente respondemos dentro de 24 horas durante días laborables',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.close': 'Cerrar',
  },
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'Over Ons',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Promocodes, Coupons & Kortingen',
    'home.subtitle': 'Ontdek exclusieve promocodes en deals voor de beste digitale producten',
    'home.cta': 'Bekijk Deals',
    'home.filterCodes': 'Filter Codes',
    'home.featured': 'Uitgelichte Deals',
    'home.statistics': 'Platform Statistieken',
    'home.noResults': 'Geen promocodes gevonden die overeenkomen met uw filters. Probeer uw filtercriteria te wijzigen.',
    'home.expertReviews': 'Expert Beoordelingen',
    'home.expertReviewsDesc': 'Ons team test elk digitaal product en promocode grondig om ervoor te zorgen dat u de beste deals krijgt met echte waarde en toegang.',
    'home.exclusiveAccess': 'Exclusieve Toegang',
    'home.exclusiveAccessDesc': 'Krijg speciale promocodes en exclusieve kortingen die u nergens anders vindt, exclusief onderhandeld voor onze gemeenschap.',
    'home.alwaysUpdated': 'Altijd Bijgewerkt',
    'home.alwaysUpdatedDesc': 'Onze promocode database wordt dagelijks bijgewerkt om ervoor te zorgen dat alle aanbiedingen actueel, actief zijn en maximale waarde bieden aan gebruikers.',
    'home.readyToSave': 'Klaar om geld te besparen? Bekijk onze best beoordeelde producten hierboven en begin vandaag nog met toegang tot premium content.',
    
    // Statistics
    'stats.users': 'Totaal Gebruikers',
    'stats.whops': 'Actieve Aanbiedingen',
    'stats.codes': 'Promocodes',
    'stats.claimed': 'Promocodes Verzilverd',
    'stats.popular': 'Meest Populair',
    
    // Whop Cards
    'whop.viewDeal': 'Verzilver Promo',
    'whop.revealCode': 'Toon Code',
    'whop.goToOffer': 'Ga naar Aanbieding',
    'whop.noCodeDisclosure': 'Geen code nodig – aanbieding wordt automatisch toegepast',
    'whop.noCode': 'Maker staat geen promocodes toe op dit moment',
    'whop.yourCode': 'Jouw code',
    'whop.offerOpenedInTab': 'Aanbieding geopend in nieuw tabblad',
    'whop.codeCopied': 'Code gekopieerd!',
    'whop.getPromo': 'Ga naar Cursus',
    
    // Whop Page
    'whop.promoCode': 'Promo Code',
    'whop.howToRedeem': 'Hoe te Gebruiken',
    'whop.productDetails': 'Product Details',
    'whop.about': 'Over',
    'whop.promoDetails': 'Promo Details',
    'whop.termsConditions': 'Voorwaarden',
    'whop.faq': 'Veel Gestelde Vragen',
    'whop.website': 'Website',
    'whop.discountValue': 'Kortingswaarde',
    'whop.price': 'Prijs',
    'whop.category': 'Categorie',
    'whop.offer': 'AANBOD',
    'whop.discount': 'KORTING',
    'whop.noPromoAvailable': 'Geen promo beschikbaar',
    'whop.varies': 'Varieert',
    
    // How to Redeem Steps
    'whop.step1': 'Klik op de "{button}" knop om toegang te krijgen tot {name}',
    'whop.step2Code': 'Kopieer het gedecodeerde promo-code',
    'whop.step2NoCode': 'Geen code nodig - korting automatisch toegepast',
    'whop.step3': 'Voltooi je registratie of aankoop',
    'whop.step4': 'Geniet van je {promo}!',
    
    // FAQ 
    'whop.faqQ1': 'Hoe gebruik ik deze {name} promo?',
    'whop.faqA1': 'Om de {promo} voor {name} te gebruiken, klik op de "{button}" knop boven.',
    'whop.faqA1Code': ' Kopieer de code en voer deze in tijdens de afhandeling.',
    'whop.faqA1NoCode': ' De korting wordt automatisch toegepast wanneer je toegang krijgt tot de link.',
    'whop.faqQ2': 'Wat voor soort dienst is {name}?',
    'whop.faqA2': '{name} is {category} gespecialiseerde oplossingen voor zijn gebruikers.',
    'whop.faqA2Category': 'in de {category} categorie en biedt',
    'whop.faqA2NoCategory': 'een exclusief dienst dat biedt',
    'whop.faqQ3': 'Hoe lang is deze korting geldig?',
    'whop.faqA3': 'De geldigheid van de promo varieert. Controleer de website van {name} voor de meest recente informatie over vervaldatums en voorwaarden.',
    
    // Terms & Conditions
    'whop.termsText': 'Deze {offer} is geldig voor {name} en is onderworpen aan hun algemene voorwaarden. De korting kan tijdelijk en beschikbaar zijn. Controleer de website van {name} voor de meest recente voorwaarden.',
    'whop.termsOffer': 'promo-code "{code}"',
    'whop.termsOfferNoCode': 'aanbod',
    
    // Footer
    'footer.description': 'Jouw vertrouwde bron voor premium digitale product promoties en exclusieve deals.',
    'footer.quickLinks': 'Snelle Links',
    'footer.legal': 'Juridisch',
    'footer.privacy': 'Privacybeleid',
    'footer.terms': 'Servicevoorwaarden',
    'footer.rights': 'Alle rechten voorbehouden.',
    
    // Legal Pages
    'legal.backToHome': 'Terug naar Home',
    'legal.lastUpdated': 'Laatst bijgewerkt',
    
    // Privacy Policy Content
    'privacy.title': 'Privacybeleid',
    'privacy.introduction.title': 'Inleiding',
    'privacy.introduction.content': 'Digital Promo Codes ("wij," "ons," of "ons") is geweten om uw privacy te beschermen. Dit Privacybeleid legt uit hoe we uw informatie verzamelen, gebruiken, delen en beschermen wanneer u onze website example.com bezoekt en onze diensten gebruikt.',
    'privacy.infoCollect.title': 'Informatie die We Verzamelen',
    'privacy.infoProvide.title': 'Informatie die U Ons Verstrekt',
    'privacy.infoProvide.content': 'Contactgegevens wanneer u contact opneemt met ons\nOpmerkingen en suggesties die u indient\nInformatie over nieuwsbriefabonnementen',
    'privacy.infoAuto.title': 'Automatisch Verzamelde Informatie',
    'privacy.infoAuto.content': 'Browsertype en -versie\nApparaatinformatie\nPáginas bezocht en tijd doorgebracht op onze site\nReferentie-websiteinformatie\nCookies en vergelijkbare trackingtechnologien',
    'privacy.howUse.title': 'Hoe We Uw Informatie Gebruiken',
    'privacy.howUse.content': 'Diensten Verstrekken: Om onze website te besturen en te onderhouden en productinformatie te verstrekken\nGebruikerservaring Verbeteren: Om gebruikspatronen te analyseren en onze inhoud en gebruikerservaring te verbeteren\nCommunicatie: Om antwoorden te geven op uw vragen en belangrijke updates te verzenden\nAnalyse: Om de prestaties van de website en de gebruikersinteractie te traceren\nJuridisch Naleven: Om te voldoen aan de toepasselijke wetten en voorschriften',
    'privacy.sharing.title': 'Informationen Delen',
    'privacy.sharing.content': 'We verkopen, ruilen of huren uw persoonlijke informatie niet uit. We kunnen informatie delen in de volgende gevallen:\n\nAffiliate Partners: Wanneer u op whop-links klikt, kunt u worden omgeleid naar onze affiliate-partners\nService providers: Con servicii de terți parti de încredere care ne ajută să operăm site-ul nostru web\nJuridische eisen: Wanneer dit is vereist door de wet of om onze rechten te beschermen\nBusiness Transfers: In verband met een fusie, vente of activa-overdracht',
    'privacy.cookies.title': 'Cookies en Tracking',
    'privacy.cookies.content': 'We gebruiken cookies en vergelijkbare technologien om:\n\nUw voorkeuren te onthouden\nWebsiteverkeer en -gebruik te analyseren\nPersoonlijk gemaakte inhoud te verstrekken\nAffiliate-aanbevelingen te volgen\n\nU kunt cookies beheren via uw browserinstellingen, maar het uitschakelen kan de werking van de website beinvloeden.',
    'privacy.security.title': 'Gegevensbeveiliging',
    'privacy.security.content': 'We implementeren gepaste beveiligingsmaatregelen om uw informatie te beschermen, waaronder:\n\nSSL-versleuteling voor gegevensoverdracht\nVeilige hostinginfrastructuur\nRegelmatige beveiligingsupdates en -controle\nBeperkt toegang tot persoonlijke informatie',
    'privacy.rights.title': 'Uw Rechten',
    'privacy.rights.content': 'U heeft het recht om:\n\nToegang te krijgen tot uw persoonlijke informatie\nOnnauwkeurige informatie te corrigeren\nEen verzoek te doen om uw informatie te verwijderen\nUitgaan van marketingcommunicatie\nObjecteren tegen het verwerken van uw informatie',
    'privacy.contact.title': 'Neem Contact Op',
    'privacy.contact.content': 'Als u vragen heeft over dit Privacybeleid of onze gegevenspraktijken, neem dan contact met ons op:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Website: <a href="/nl/contact">Contactformulier</a>',
    
    // Terms of Service Content
    'terms.title': 'Servicevoorwaarden',
    'terms.agreement.title': 'Overeenkomst met Servicevoorwaarden',
    'terms.agreement.content': 'Door toegang te krijgen en te gebruiken Digital Promo Codes ("wij," "ons," of "ons"), gaat u akkoord en gaat u ervan uit dat u zich aan de voorwaarden en bepalingen van deze overeenkomst moet houden. Als u niet akkoord gaat met de bovenstaande, gelieve deze dienst niet te gebruiken.',
    'terms.license.title': 'Gebruikslicentie',
    'terms.license.content': 'Er is toestemming verleend om tijdelijk een kopie van de materialen op Digital Promo Codes te downloaden voor persoonlijk, niet-commercieel tijdelijk bekijken. Dit is het verlenen van een licentie, niet een titeloverdracht, en onder deze licentie mag u dit niet:\n\nModificar o copiar los materiales\nUsar los materiales para cualquier propósito comercial o para cualquier exhibición pública\nIntentar invertir ingeniería de software contenido en el sitio web\nEliminar cualquier notación de propiedad intelectual o cualquier otra',
    'terms.disclaimer.title': 'Afwijzing',
    'terms.disclaimer.content': 'Informationsgenauigkeit: De materialen op Digital Promo Codes worden "so verkauft". Wir garantieren keine expliziten oder impliziten Garantien.\nDiensten von derden: We zijn niet verantwoordelijk voor de inhoud, beleid of praktijken van derde-partijwhop-websites die we linken naar.\nPromotiebeschikbaarheid: Promoties en kortingen whop zijn onderhevig aan wijzigingen zonder voorafgaande melding. We garanderen niet de beschikbaarheid of voorwaarden van enige promotieaanbieding.',
    'terms.responsible.title': 'Verantwoordelijk Gebruik',
    'terms.responsible.content': 'Digital Promo Codes stimuleert verantwoord gebruik van digitale producten en diensten. We aanmoedigen gebruikers om:\n\nAlleen producten en diensten te kopen die ze kunnen betalen\nProdukte grondig te onderzoeken voordat ze worden gekocht\nVoorwaarden en voorwaarden van whop-producten grondig te lezen\nDirect contact opnemen met whop-providers voor productondersteuning\n\nAls u zorgen heeft over een whop-product of -dienst, gelieve direct contact op te nemen met de provider of contacteer ons via ons contactformulier.',
    'terms.contactInfo.title': 'Contactgegevens',
    'terms.contactInfo.content': 'Als u vragen heeft over deze Servicevoorwaarden, gelieve contact met ons op:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Website: <a href="/nl/contact">Contactformulier</a>',
    
    // Contact
    'contact.title': 'Neem Contact Op',
    'contact.subtitle': 'Neem contact op met ons team',
    'contact.name': 'Naam',
    'contact.email': 'E-mail',
    'contact.subject': 'Onderwerp',
    'contact.message': 'Bericht',
    'contact.send': 'Verstuur Bericht',
    'contact.sendMessage': 'Stuur ons een Bericht',
    'contact.getInTouch': 'Neem Contact Op',
    'contact.backToHome': 'Terug naar Home',
    'contact.faqTitle': 'Veel Gestelde Vragen',
    'contact.faq1Question': 'Hoe claim ik een promotie?',
    'contact.faq1Answer': 'Klik op de "Promo Ophalen" knop op een whop kaart om te worden omgeleid naar de whop. Volg hun registratieprozess en gebruik eventuele geleverde promotiecodes.',
    'contact.faq2Question': 'Zijn deze promos echt legitieme?',
    'contact.faq2Answer': 'Ja, we tonen alleen promos van geverifieerde en betrouwbare whops. Alle aanbiedingen worden geverifieerd en regelmatig bijgewerkt.',
    'contact.faq3Question': 'Biedt u klantenservice voor whop problemen?',
    'contact.faq3Answer': 'We bieden informatie over promos, maar voor account- of productproblemen moet u direct contact opnemen met de whop.',
    'contact.successMessage': 'Bedankt voor uw bericht! Wij nemen binnen 24 uur contact met u op.',
    'contact.errorMessage': 'Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het opnieuw of neem direct contact met ons op.',
    'contact.emailSupport': 'E-Mail Ondersteuning',
    'contact.emailSupportDesc': 'Voor algemene vragen en ondersteuning',
    'contact.businessInquiries': 'Zakelijke Vragen',
    'contact.businessInquiriesDesc': 'Voor partnerschappen en zakelijke mogelijkheden',
    'contact.responseTime': 'Antwoordtijd',
    'contact.responseTimeDesc': 'We antwoorden normaal gesproken binnen 24 uur tijdens werkdagen',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fout',
    'common.success': 'Succes',
    'common.close': 'Sluiten',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Promotions Premium de Produits Numériques',
    'home.subtitle': 'Découvrez des codes promo exclusifs et des offres pour les meilleurs produits numériques',
    'home.cta': 'Voir les Offres',
    'home.filterCodes': 'Filtrer Codes',
    'home.featured': 'Offres en Vedette',
    'home.statistics': 'Statistiques de la Plateforme',
    'home.noResults': 'Aucun code promo trouvé correspondant à vos filtres. Essayez de modifier vos critères de filtre.',
    'home.expertReviews': 'Avis d\'Experts',
    'home.expertReviewsDesc': 'Notre équipe teste minutieusement chaque produit numérique et code promo pour s\'assurer que vous obtenez les meilleures offres avec une valeur authentique et un accès.',
    'home.exclusiveAccess': 'Accès Exclusif',
    'home.exclusiveAccessDesc': 'Obtenez des codes promo spéciaux et des remises exclusives que vous ne trouverez nulle part ailleurs, négociés exclusivement pour notre communauté.',
    'home.alwaysUpdated': 'Toujours Mis à Jour',
    'home.alwaysUpdatedDesc': 'Notre base de données de codes promo est mise à jour quotidiennement pour s\'assurer que toutes les offres sont actuelles, actives et offrent une valeur maximale aux utilisateurs.',
    'home.readyToSave': 'Prêt à économiser de l\'argent ? Parcourez nos produits les mieux notés ci-dessus et commencez à accéder au contenu premium dès aujourd\'hui.',
    
    // Statistics
    'stats.users': 'Utilisateurs Totaux',
    'stats.whops': 'Offres Actives',
    'stats.codes': 'Codes Promo',
    'stats.claimed': 'Codes Promo Réclamés',
    'stats.popular': 'Plus Populaire',
    
    // Whop Cards
    'whop.viewDeal': 'Utiliser Promo',
    'whop.revealCode': 'Révéler le Code',
    'whop.goToOffer': 'Accéder à l\'Offre',
    'whop.noCodeDisclosure': 'Aucun code requis – l\'offre s\'applique automatiquement',
    'whop.noCode': 'Le créateur n\'autorise pas les codes promo pour le moment',
    'whop.yourCode': 'Votre code',
    'whop.offerOpenedInTab': 'Offre ouverte dans un nouvel onglet',
    'whop.codeCopied': 'Code copié !',
    'whop.getPromo': 'Aller au Cours',
    
    // Whop Page
    'whop.promoCode': 'Code Promo',
    'whop.howToRedeem': 'Comment L\'Utiliser',
    'whop.productDetails': 'Détails du Produit',
    'whop.about': 'À Propos',
    'whop.promoDetails': 'Détails de la Promotion',
    'whop.termsConditions': 'Conditions d\'Utilisation',
    'whop.faq': 'Questions Fréquentes',
    'whop.website': 'Site Web',
    'whop.discountValue': 'Valeur de Réduction',
    'whop.price': 'Prix',
    'whop.category': 'Catégorie',
    'whop.offer': 'OFFRE',
    'whop.discount': 'RÉDUCTION',
    'whop.noPromoAvailable': 'Pas de promo disponible',
    'whop.varies': 'Varie',
    
    // How to Redeem Steps
    'whop.step1': 'Cliquez sur le bouton "{button}" pour accéder à {name}',
    'whop.step2Code': 'Copiez le code promo révélé',
    'whop.step2NoCode': 'Pas de code nécessaire - réduction automatique appliquée',
    'whop.step3': 'Complétez votre inscription ou votre achat',
    'whop.step4': 'Profitez de votre {promo}!',
    
    // FAQ 
    'whop.faqQ1': 'Comment utiliser ce code promo de {name}?',
    'whop.faqA1': 'Pour utiliser la promotion {promo} pour {name}, cliquez sur le bouton "{button}" ci-dessus.',
    'whop.faqA1Code': ' Copiez le code et entrez-le lors de la caisse.',
    'whop.faqA1NoCode': ' La réduction sera automatiquement appliquée lorsque vous accéderez au lien.',
    'whop.faqQ2': 'Quel type de serviço est {name}?',
    'whop.faqA2': '{name} est {category} solutions spécialisées pour ses utilisateurs.',
    'whop.faqA2Category': 'nella categoria {category} e fornisce',
    'whop.faqA2NoCategory': 'um servizio esclusivo che fornisce',
    'whop.faqQ3': 'Por quanto tempo é válido este desconto?',
    'whop.faqA3': 'A validade do promo varia. Por favor, consulte o site do {name} para as informações mais recentes sobre datas de validade e termos.',
    
    // Terms & Conditions
    'whop.termsText': 'Cette {offer} est valide pour {name} et est soumise à ses termes et conditions généraux. La réduction peut être limitée en temps et en disponibilité. Veuillez consulter le site web de {name} pour les termes et conditions les plus récents.',
    'whop.termsOffer': 'code promo "{code}"',
    'whop.termsOfferNoCode': 'offre',
    
    // Footer
    'footer.description': 'Votre source fiable pour les promotions premium de produits numériques et les offres exclusives.',
    'footer.quickLinks': 'Liens Rapides',
    'footer.legal': 'Légal',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions de Service',
    'footer.rights': 'Tous droits réservés.',
    
    // Legal Pages
    'legal.backToHome': 'Retour à la Maison',
    'legal.lastUpdated': 'Dernière mise à jour',
    
    // Privacy Policy Content
    'privacy.title': 'Politique de Confidentialité',
    'privacy.introduction.title': 'Introduction',
    'privacy.introduction.content': 'Digital Promo Codes ("nous," "notre," ou "nous") s\'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site web example.com et utilisez nos services.',
    'privacy.infoCollect.title': 'Informations que Nous Collectons',
    'privacy.infoProvide.title': 'Informations que Vous Nous Fournissez',
    'privacy.infoProvide.content': 'Informations de contact lorsque vous nous contactez\nCommentaires et suggestions que vous soumettez\nInformations d\'abonnement à la newsletter',
    'privacy.infoAuto.title': 'Informations Automatiquement Collectées',
    'privacy.infoAuto.content': 'Type et version du navigateur\nInformations sur l\'appareil\nPáginas visitées et temps passé sur notre site\nInformations du site de référence\nCookies et technologies de suivi similaires',
    'privacy.howUse.title': 'Comment Nous Utilisons Vos Informations',
    'privacy.howUse.content': 'Fournir des Services: Pour exploiter et maintenir notre site web et fournir des informations sur les produits\nAméliorer l\'Expérience: Pour analyser les modèles d\'utilisation et améliorer notre contenu et l\'expérience utilisateur\nCommunication: Pour répondre à vos questions et envoyer des mises à jour importantes\nAnalyse: Pour suivre les performances du site web et l\'engagement des utilisateurs\nConformité Légale: Pour se conformer aux lois et réglementations applicables',
    'privacy.sharing.title': 'Partage d\'Informations',
    'privacy.sharing.content': 'Nous ne vendons, n\'échangeons ni ne louons vos informations personnelles. Nous pouvons partager des informations dans les circonstances suivantes:\n\nPartenaires Affiliés: Lorsque vous cliquez sur des liens whop, vous pouvez être redirigé vers nos partenaires affiliés\nFournisseurs de Services: Avec des services de terze parti fidate qui nous aident à exploiter notre site web\nExigences Légales: Lorsque requis par la loi ou pour protéger nos droits\nTransferts d\'Entreprise: En relation avec une fusion, vente ou transfert d\'actifs',
    'privacy.cookies.title': 'Cookies et Suivi',
    'privacy.cookies.content': 'Nous utilisons des cookies et des technologies similaires pour:\n\nSe souvenir de vos préférences\nAnalyser le trafic du site web et son utilisation\nFournir du contenu personnalisé\nSuivre les références d\'affiliation\n\nVous pouvez contrôler les cookies via les paramètres de votre navigateur, mais les désactiver peut affecter la fonctionnalité du site web.',
    'privacy.security.title': 'Sécurité des Données',
    'privacy.security.content': 'Nous mettons en place des mesures de sécurité appropriées pour protéger vos informations, notamment:\n\nChiffrement SSL pour la transmission de données\nInfrastructure d\'hébergement sécurisée\nMises à jour de sécurité et surveillance régulières\nAccès limité aux informations personnelles',
    'privacy.rights.title': 'Vos Droits',
    'privacy.rights.content': 'Vous avez le droit de:\n\nAccéder à vos informations personnelles\nCorriger les informations inexactes\nDemander la suppression de vos informations\nRefuser de participer aux communications marketing\nVous opposer au traitement de vos informations',
    'privacy.contact.title': 'Nous Contacter',
    'privacy.contact.content': 'Si vous avez des questions sur cette Politique de Confidentialité ou nos pratiques de données, veuillez nous contacter:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Site web: <a href="/fr/contact">Formulaire de Contact</a>',
    
    // Terms of Service Content
    'terms.title': 'Conditions de Service',
    'terms.agreement.title': 'Accord aux Conditions',
    'terms.agreement.content': 'En accédant et en utilisant Digital Promo Codes ("nous," "notre," ou "nous"), vous acceptez et convenez d\'être lié par les termes et dispositions de cet accord. Si vous n\'êtes pas d\'accord avec ce qui précède, veuillez ne pas utiliser ce service.',
    'terms.license.title': 'Licence d\'Utilisation',
    'terms.license.content': 'La permission est accordée de télécharger temporairement une copie des matériaux sur Digital Promo Codes pour un visionnage personnel, non commercial et transitoire uniquement. Ceci est l\'octroi d\'une licence, non un transfert de titre, et sous cette licence vous ne pouvez pas:\n\nModifier ou copier les matériaux\nUtiliser les matériaux pour tout usage commercial ou public\nTenter d\'effectuer de l\'ingénierie inverse de tout logiciel contenu sur le site web\nSupprimer toute notation de propriété intellectuelle ou autre',
    'terms.disclaimer.title': 'Avis de non-responsabilité',
    'terms.disclaimer.content': 'Précision des Informations: Les matériaux sur Digital Promo Codes sont fournis "en l\'état". Nous ne donnons aucune garantie, expresse ou implicite.\nServices Tiers: Nous ne sommes pas responsables du contenu, des politiques ou des pratiques des sites web whop tiers vers lesquels nous créons des liens.\nDisponibilité des Promotions: Les promotions et remises whop sont sujettes à changement sans préavis. Nous ne garantissons pas la disponibilité ou les termes de toute offre promotionnelle.',
    'terms.responsible.title': 'Utilisation Responsable',
    'terms.responsible.content': 'Digital Promo Codes promeut l\'utilisation responsable de produits et services numériques. Nous encourageons les utilisateurs à:\n\nN\'acheter que des produits et services qu\'ils peuvent se permettre\nRechercher les produits de manière approfondie avant d\'acheter\nLire attentivement les termes et conditions des produits whop\nContacter directement les fournisseurs whop pour product support\n\nSi vous avez des préoccupations concernant un produit ou service whop, veuillez contacter directement le fournisseur ou nous contacter via notre formulaire de contact.',
    'terms.contactInfo.title': 'Informations de Contact',
    'terms.contactInfo.content': 'Si vous avez des questions sur ces Conditions de Service, veuillez nous contacter:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Site web: <a href="/fr/contact">Formulaire de Contact</a>',
    
    // Contact
    'contact.title': 'Nous Contacter',
    'contact.subtitle': 'Entrez en contact avec notre équipe',
    'contact.name': 'Nom',
    'contact.email': 'E-mail',
    'contact.subject': 'Betreff',
    'contact.message': 'Nachricht',
    'contact.send': 'Nachricht Senden',
    'contact.sendMessage': 'Senden Sie uns eine Nachricht',
    'contact.getInTouch': 'Kontakt Aufnehmen',
    'contact.backToHome': 'Zurück zur Startseite',
    'contact.faqTitle': 'Questions Fréquentes',
    'contact.faq1Question': 'Comment puis-je réclamer une promotion?',
    'contact.faq1Answer': 'Cliquez sur le bouton "Obtenir la Promotion" sur une carte whop pour être redirigé vers le whop. Suivez leur processus d\'inscription et utilisez tout code promo fourni.',
    'contact.faq2Question': 'Sont-elles authentiques?',
    'contact.faq2Answer': 'Oui, nous ne présentons que des promotions de whops verifiés et fiables. Toutes les offres sont vérifiées et mises à jour régulièrement.',
    'contact.faq3Question': 'Fournissez-vous un support client pour les problèmes whop?',
    'contact.faq3Answer': 'Nous fournissons des informations sur les promotions, mais pour les problèmes de compte ou de produit, vous devrez contacter le whop directement.',
    'contact.successMessage': 'Merci pour votre message ! Nous vous répondrons dans les 24 heures.',
    'contact.errorMessage': 'Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer ou nous contacter directement.',
    'contact.emailSupport': 'Support Email',
    'contact.emailSupportDesc': 'Pour les demandes générales et le support',
    'contact.businessInquiries': 'Demandes Commerciales',
    'contact.businessInquiriesDesc': 'Pour les partenariats et opportunités comerciaux',
    'contact.responseTime': 'Temps de Réponse',
    'contact.responseTimeDesc': 'Nous répondons généralement dans les 24 heures pendant les jours ouvrables',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.close': 'Fermer',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.about': 'Über Uns',
    'nav.contact': 'Kontakt',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Deals, Gutscheine & Rabatte',
    'home.subtitle': 'Entdecken Sie exklusive Promocodes und Angebote für die besten digitalen Produkte',
    'home.cta': 'Angebote Durchsuchen',
    'home.filterCodes': 'Filter Codes',
    'home.featured': 'Empfohlene Angebote',
    'home.statistics': 'Plattform Statistiken',
    'home.noResults': 'Keine Promocodes gefunden, die Ihren Filtern entsprechen. Versuchen Sie, Ihre Filterkriterien zu ändern.',
    'home.expertReviews': 'Experten-Bewertungen',
    'home.expertReviewsDesc': 'Unser Team testet jedes digitale Produkt und jeden Promocode gründlich, um sicherzustellen, dass Sie die besten Angebote mit echtem Wert und Zugang erhalten.',
    'home.exclusiveAccess': 'Exklusiver Zugang',
    'home.exclusiveAccessDesc': 'Erhalten Sie spezielle Promocodes und exklusive Rabatte, die Sie nirgendwo anders finden, exklusiv für unsere Gemeinschaft verhandelt.',
    'home.alwaysUpdated': 'Immer Aktuell',
    'home.alwaysUpdatedDesc': 'Unsere Promocode-Datenbank wird täglich aktualisiert, um sicherzustellen, dass alle Angebote aktuell, aktiv sind und maximalen Wert für Benutzer bieten.',
    'home.readyToSave': 'Bereit, Geld zu sparen? Durchsuchen Sie unsere bestbewerteten Produkte oben und beginnen Sie noch heute mit dem Zugang zu Premium-Inhalten.',
    
    // Statistics
    'stats.users': 'Gesamte Benutzer',
    'stats.whops': 'Aktive Angebote',
    'stats.codes': 'Promocodes',
    'stats.claimed': 'Promocodes Eingelöst',
    'stats.popular': 'Am Beliebtesten',
    
    // Whop Cards
    'whop.viewDeal': 'Promo Einlösen',
    'whop.revealCode': 'Code Enthüllen',
    'whop.goToOffer': 'Zum Angebot',
    'whop.noCodeDisclosure': 'Kein Code erforderlich – Angebot wird automatisch angewendet',
    'whop.noCode': 'Ersteller erlaubt derzeit keine Promo-Codes',
    'whop.yourCode': 'Dein Code',
    'whop.offerOpenedInTab': 'Angebot in neuem Tab geöffnet',
    'whop.codeCopied': 'Code kopiert!',
    'whop.getPromo': 'Zum Kurs Gehen',
    
    // Whop Page
    'whop.promoCode': 'Promo Code',
    'whop.howToRedeem': 'Wie Es Verwendet',
    'whop.productDetails': 'Produkt Details',
    'whop.about': 'Über Uns',
    'whop.promoDetails': 'Promo Details',
    'whop.termsConditions': 'Nutzungsbedingungen',
    'whop.faq': 'Häufig Gestellte Fragen',
    'whop.website': 'Website',
    'whop.discountValue': 'Rabattwert',
    'whop.price': 'Preis',
    'whop.category': 'Kategorie',
    'whop.offer': 'ANGEBOT',
    'whop.discount': 'RABATT',
    'whop.noPromoAvailable': 'Keine Promo verfügbar',
    'whop.varies': 'Variiert',
    
    // How to Redeem Steps
    'whop.step1': 'Klicken Sie auf die "{button}" Schaltfläche, um auf {name} zuzugreifen',
    'whop.step2Code': 'Kopieren Sie den enthüllten Promo-Code',
    'whop.step2NoCode': 'Kein Code erforderlich - Rabatt wird automatisch angewendet',
    'whop.step3': 'Registrieren Sie sich oder kaufen Sie',
    'whop.step4': 'Genießen Sie Ihr {promo}!',
    
    // FAQ 
    'whop.faqQ1': 'Wie verwende ich diesen {name} Promo?',
    'whop.faqA1': 'Um die {promo} für {name} zu verwenden, klicken Sie auf die "{button}" Schaltfläche oben.',
    'whop.faqA1Code': ' Kopieren Sie den Code und geben Sie ihn während der Kasse ein.',
    'whop.faqA1NoCode': ' Der Rabatt wird automatisch angewendet, wenn Sie auf die Verknüpfung zugreifen.',
    'whop.faqQ2': 'Was für eine Art von Dienstleistung ist {name}?',
    'whop.faqA2': '{name} ist {category} gespecialiseerte Lösungen für seine Benutzer.',
    'whop.faqA2Category': 'in der {category} Kategorie und bietet',
    'whop.faqA2NoCategory': 'um servizio esclusivo che fornisce',
    'whop.faqQ3': 'Hoe lang ist dieser Rabatt gültig?',
    'whop.faqA3': 'Die Gültigkeit der Promo variiert. Bitte überprüfen Sie die Website von {name} für die aktuellsten Informationen zu Ablaufdaten und Bedingungen.',
    
    // Terms & Conditions
    'whop.termsText': 'Dieses {offer} ist gültig für {name} und unterliegt seinen allgemeinen Geschäftsbedingungen und Bedingungen. Der Rabatt kann zeitlich und verfügbar sein. Bitte überprüfen Sie die Website von {name} für die aktuellsten Bedingungen und Bedingungen.',
    'whop.termsOffer': 'Promo-Code "{code}"',
    'whop.termsOfferNoCode': 'Angebot',
    
    // Footer
    'footer.description': 'Ihre vertrauenswürdige Quelle für Promo-Codes, Gutscheine, Rabatte und exklusive Angebote.',
    'footer.quickLinks': 'Schnelle Links',
    'footer.legal': 'Rechtliches',
    'footer.privacy': 'Datenschutzrichtlinie',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.rights': 'Alle Rechte vorbehalten.',
    
    // Legal Pages
    'legal.backToHome': 'Zurück zur Startseite',
    'legal.lastUpdated': 'Zuletzt aktualisiert',
    
    // Privacy Policy Content
    'privacy.title': 'Datenschutzrichtlinie',
    'privacy.introduction.title': 'Einleitung',
    'privacy.introduction.content': 'Digital Promo Codes ("wir," "unser," oder "uns") ist darum bemüht, Ihre Privatsphäre zu schützen. Diese Datenschutzrichtlinie erklärt, wie wir Ihre Informationen sammeln, verwenden, offenbaren und schützen, wenn Sie unsere Website example.com besuchen und unsere Dienste nutzen.',
    'privacy.infoCollect.title': 'Informationen, die wir sammeln',
    'privacy.infoProvide.title': 'Informationen, die Sie uns geben',
    'privacy.infoProvide.content': 'Kontaktdaten, wenn Sie sich bei uns melden\nKommentare und Vorschläge, die Sie einreichen\nInformationen zur Newsletter-Abonnement',
    'privacy.infoAuto.title': 'Automatisch Verzamelde Informatie',
    'privacy.infoAuto.content': 'Browsertyp und -version\nGeräteinformationen\nPáginas bezocht und Zeit, die Sie auf unserer Website verbringen\nReferenz-Website-Informationen\nCookies und ähnliche Tracking-Technologien',
    'privacy.howUse.title': 'Wie wir Ihre Informationen verwenden',
    'privacy.howUse.content': 'Dienste bereitstellen: Um unsere Website zu betreiben und zu unterhalten und Produktinformationen bereitzustellen\nBenutzererfahrung verbessern: Um Nutzungsmuster zu analysieren und unseren Inhalt und die Benutzererfahrung zu verbessern\nKommunikation: Um Ihren Fragen zu antworten und wichtige Updates zu senden\nAnalyse: Um die Website-Leistung und die Benutzerinteraktion zu überwachen\nRechtliches einhalten: Um Gesetzes- und Regelungsbestimmungen einzuhalten',
    'privacy.sharing.title': 'Informationen teilen',
    'privacy.sharing.content': 'Wir verkaufen, tauschen oder vermieten Ihre persönlichen Informationen niet uit. Wir können Informationen teilen, wenn dies aus folgenden Gründen erforderlich ist:\n\nAffiliate-Partner: Wenn Sie auf whop-Links klicken, können Sie zu unseren Affiliate-Partnern umgeleitet werden\nDienstleister: Mit vertrauenswürdigen Drittanbieterdiensten, die uns helfen, unsere Website zu betreiben\nJuridische Anforderungen: Wenn dies von der Gesetzgebung oder der Beschützung unserer Rechte erforderlich ist\nGeschäftsübertragungen: In Verbindung mit einer Fusion, Übernahme oder Vermögensübertragung',
    'privacy.cookies.title': 'Cookies und Tracking',
    'privacy.cookies.content': 'Wir verwenden Cookies und ähnliche Technologien, um:\n\nIhre Präferenzen zu erinnern\nWebsite-Traffic und -Nutzung zu analysieren\nPersonalisierte Inhalte bereitzustellen\nAffiliate-Referenzen zu verfolgen\n\nSie können Cookies über die Einstellungen Ihres Browsers steuern, aber deren Deaktivierung kann die Funktionalität der Website beeinträchtigen.',
    'privacy.security.title': 'Datensicherheit',
    'privacy.security.content': 'Wir implementieren angemessene Sicherheitsmaßnahmen, um Ihre Informationen zu schützen, einschließlich:\n\nSSL-Verschlüsselung für Datentransmission\nSichere Hosting-Infrastruktur\nRegelmatige beveiligingsupdates und -überwachung\nEingeschränkten Zugriff auf persönliche Informationen',
    'privacy.rights.title': 'Ihre Rechte',
    'privacy.rights.content': 'Sie haben das Recht:\n\nZugriff auf Ihre persönlichen Informationen zu haben\nUnrichtige Informationen zu korrigieren\nEin Verlangen zu erheben, Ihre Informationen zu löschen\nAusstieg aus Marketingkommunikationen\nWiderspruch gegen das Verarbeiten Ihrer Informationen',
    'privacy.contact.title': 'Kontaktieren Sie Uns',
    'privacy.contact.content': 'Wenn Sie Fragen oder Bedenken zu dieser Datenschutzrichtlinie oder unseren Datenpraktiken haben, wenden Sie sich bitte an uns:<br><br>E-Mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Website: <a href="/de/contact">Kontaktformular</a>',
    
    // Terms of Service Content
    'terms.title': 'Nutzungsbedingungen',
    'terms.agreement.title': 'Zustimmung zu den Nutzungsbedingungen',
    'terms.agreement.content': 'Durch den Zugriff und die Nutzung von Digital Promo Codes ("wir," "unser," oder "uns") erklären Sie sich damit einverstanden, an die Bedingungen und Bestimmungen dieses Vertrags gebunden zu sein. Wenn Sie dies nicht tun, bitte verwenden Sie diesen Dienst nicht.',
    'terms.license.title': 'Licenza di Uso',
    'terms.license.content': 'Es wird eine Erlaubnis erteilt, temporär eine Kopie der Materialien auf Digital Promo Codes herunterzuladen, nur für persönliche, nichtkommerzielle vorübergehende Ansicht. Dies ist das Erteilen einer Lizenz, keine Übertragung des Titels, und unter dieser Lizenz dürfen Sie dies nicht:\n\nModificar o copiar los materiales\nUsar los materiales para cualquier propósito comercial o para cualquier exhibición pública\nIntentar invertir ingeniería de software contenido en el sitio web\nEliminar cualquier notación de propiedad intelectual o cualquier otra',
    'terms.disclaimer.title': 'Haftungsausschluss',
    'terms.disclaimer.content': 'Informationsgenauigkeit: Die Materialien auf Digital Promo Codes werden "wie besehen" bereitgestellt. Wir gewähren keine ausdrücklichen oder stillschweigenden Garantien.\nDrittanbieterdienste: Wir sind nicht verantwortlich für den Inhalt, die Richtlinien oder Praktiken von Drittanbieter-Websites, zu denen wir verlinken.\nVerfügbarkeit von Promotionen: Promotionen und Rabatte können sich ohne Vorankündigung ändern. Wir garantieren nicht die Verfügbarkeit oder Bedingungen von Werbeangeboten.',
    'terms.responsible.title': 'Verantwortungsvolle Nutzung',
    'terms.responsible.content': 'Digital Promo Codes fördert den verantwortungsvollen Gebrauch digitaler Produkte und Dienste. Wir ermutigen die Benutzer dazu:\n\nNur Produkte und Dienste zu kaufen, die sie sich leisten können\nProdukte gründlich zu recherchieren, bevor sie gekauft werden\nBedingungen und Bestimmungen von whop-Produkten sorgfältig zu lesen\nDirekt mit whop-Anbietern zu kontaktieren, um Produktunterstützung zu erhalten\n\nWenn Sie Bedenken über ein whop-Produkt oder -Dienst haben, wenden Sie sich bitte direkt an den Anbieter oder kontaktieren Sie uns über unser Kontaktformular.',
    'terms.contactInfo.title': 'Kontaktinformationen',
    'terms.contactInfo.content': 'Wenn Sie Fragen oder Bedenken zu diesen Nutzungsbedingungen haben, wenden Sie sich bitte an uns:<br><br>E-Mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Website: <a href="/de/contact">Kontaktformular</a>',
    
    // Contact
    'contact.title': 'Kontaktieren Sie Uns',
    'contact.subtitle': 'Nehmen Sie Kontakt mit unserem Team auf',
    'contact.name': 'Name',
    'contact.email': 'E-Mail',
    'contact.subject': 'Betreff',
    'contact.message': 'Nachricht',
    'contact.send': 'Nachricht Senden',
    'contact.sendMessage': 'Senden Sie uns eine Nachricht',
    'contact.getInTouch': 'Kontakt Aufnehmen',
    'contact.backToHome': 'Zurück zur Startseite',
    'contact.faqTitle': 'Häufig Gestellte Fragen',
    'contact.faq1Question': 'Wie kann ich eine Promotion beanspruchen?',
    'contact.faq1Answer': 'Klicken Sie auf die "Promo erhalten" Schaltfläche auf einer whop Karte, um zu der whop weitergeleitet zu werden. Volg ihrem Registrierungsprozess und verwenden Sie alle bereitgestellten Promo-Codes.',
    'contact.faq2Question': 'Sind diese Promotions echt legitime?',
    'contact.faq2Answer': 'Ja, wir zeigen nur Promos von verifizierten und zuverlässigen whops. Alle Angebote werden geverifieerd und regelmäßig aktualisiert.',
    'contact.faq3Question': 'Bieten Sie Kundendienst für whop Probleme an?',
    'contact.faq3Answer': 'Wir geben Informationen zu Promos, aber für Konto- oder Produktproblemen müssen Sie direkt mit dem whop kontaktieren.',
    'contact.successMessage': 'Vielen Dank für Ihre Nachricht! Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
    'contact.errorMessage': 'Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.',
    'contact.emailSupport': 'E-Mail Support',
    'contact.emailSupportDesc': 'Für allgemeine Anfragen und Support',
    'contact.businessInquiries': 'Geschäftsanfragen',
    'contact.businessInquiriesDesc': 'Für Partnerschaften und Geschäftsmöglichkeiten',
    'contact.responseTime': 'Antwortzeit',
    'contact.responseTimeDesc': 'Wir antworten normalerweise innerhalb von 24 Stunden an Werktagen',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.close': 'Schließen',
  },
  it: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'Chi Siamo',
    'nav.contact': 'Contatto',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Codici Promo, Coupon e Sconti',
    'home.subtitle': 'Scopri codici promo esclusivi e offerte per i migliori prodotti digitali',
    'home.cta': 'Sfoglia Offerte',
    'home.filterCodes': 'Filtra Corsi',
    'home.featured': 'Offerte in Evidenza',
    'home.statistics': 'Statistiche della Piattaforma',
    'home.noResults': 'Nessun codice promo trovato corrispondente ai tuoi filtri. Prova a modificare i tuoi criteri di filtro.',
    'home.expertReviews': 'Recensioni degli Esperti',
    'home.expertReviewsDesc': 'Il nostro team testa minutieusement ogni prodotto digitale e codice promozionale per assicurarsi che tu ottenga le migliori offerte con valore autentico e accesso.',
    'home.exclusiveAccess': 'Accesso Esclusivo',
    'home.exclusiveAccessDesc': 'Ottieni codici promozionali speciali e sconti esclusivi che non trovi altrove, negoziati esclusivamente per la nostra comunità.',
    'home.alwaysUpdated': 'Sempre Aggiornato',
    'home.alwaysUpdatedDesc': 'Il nostro database di codici promozionali viene aggiornato quotidianamente per assicurarsi che tutte le offerte siano attuali, attive e forniscano il massimo valore agli utenti.',
    'home.readyToSave': 'Pronto per risparmiare denaro? Sfoglia i nostri prodotti meglio classificati sopra e inizia ad accedere al contenuto premium oggi.',
    
    // Statistics
    'stats.users': 'Utenti Totali',
    'stats.whops': 'Offerte Attive',
    'stats.codes': 'Codici Promo',
    'stats.claimed': 'Codici Promo Riscattati',
    'stats.popular': 'Più Popolare',
    
    // Whop Cards
    'whop.viewDeal': 'Riscatta Promo',
    'whop.revealCode': 'Rivela Codice',
    'whop.goToOffer': 'Vai all\'Offerta',
    'whop.noCodeDisclosure': 'Nessun codice richiesto – l\'offerta viene applicata automaticamente',
    'whop.noCode': 'Il creatore non consente codici promo al momento',
    'whop.yourCode': 'Il tuo codice',
    'whop.offerOpenedInTab': 'Offerta aperta in una nuova scheda',
    'whop.codeCopied': 'Codice copiato!',
    'whop.getPromo': 'Vai al Corso',
    
    // Whop Page
    'whop.promoCode': 'Codice Promo',
    'whop.howToRedeem': 'Come Utilizzare',
    'whop.productDetails': 'Dettagli Prodotto',
    'whop.about': 'Chi Siamo',
    'whop.promoDetails': 'Dettagli Promo',
    'whop.termsConditions': 'Termini e Condizioni',
    'whop.faq': 'Domande Frequenti',
    'whop.website': 'Sito Web',
    'whop.discountValue': 'Valore Sconto',
    'whop.price': 'Prezzo',
    'whop.category': 'Categoria',
    'whop.offer': 'OFFERTA',
    'whop.discount': 'Sconto',
    'whop.noPromoAvailable': 'Nessuna promo disponibile',
    'whop.varies': 'Varia',
    
    // How to Redeem Steps
    'whop.step1': 'Clicca sul bottone "{button}" per accedere a {name}',
    'whop.step2Code': 'Copia il codice promozionale rivelato',
    'whop.step2NoCode': 'Nessun codice necessario - sconto applicato automaticamente',
    'whop.step3': 'Completa la registrazione o l\'acquisto',
    'whop.step4': 'Goditi il tuo {promo}!',
    
    // FAQ 
    'whop.faqQ1': 'Come utilizzare questo promo {name}?',
    'whop.faqA1': 'Per utilizzare la promo {promo} per {name}, clicca sul bottone "{button}" sopra.',
    'whop.faqA1Code': ' Copia il codice e inseriscilo durante il checkout.',
    'whop.faqA1NoCode': ' Ora lo sconto verrà applicato automaticamente quando accedi al link.',
    'whop.faqQ2': 'Che tipo di servizio è {name}?',
    'whop.faqA2': '{name} è {category} soluzioni specializzate per i suoi utenti.',
    'whop.faqA2Category': 'nella categoria {category} e fornisce',
    'whop.faqA2NoCategory': 'um servizio esclusivo che fornisce',
    'whop.faqQ3': 'Por quanto tempo è válido este desconto?',
    'whop.faqA3': 'A validade do promo varia. Por favor, consulte o site do {name} para as informações mais recentes sobre datas de validade e termos.',
    
    // Terms & Conditions
    'whop.termsText': 'Questa {offer} è valida per {name} e soggetta ai suoi termini e condizioni generali. Lo sconto potrebbe essere limitato nel tempo e nella disponibilità. Si prega di controllare il sito web di {name} per i termini e condizioni più recenti.',
    'whop.termsOffer': 'codice promozionale "{code}"',
    'whop.termsOfferNoCode': 'offerta',
    
    // Footer
    'footer.description': 'La tua fonte fidata per promozioni premium di prodotti digitali e offerte esclusive.',
    'footer.quickLinks': 'Link Rapidi',
    'footer.legal': 'Legale',
    'footer.privacy': 'Politica sulla Privacy',
    'footer.terms': 'Termini di Servizio',
    'footer.rights': 'Tutti i diritti riservati.',
    
    // Legal Pages
    'legal.backToHome': 'Torna a Home',
    'legal.lastUpdated': 'Ultimo aggiornamento',
    
    // Privacy Policy Content
    'privacy.title': 'Politica sulla Privacy',
    'privacy.introduction.title': 'Introduzione',
    'privacy.introduction.content': 'Digital Promo Codes ("noi," "nostro," o "nostro") si impegna a proteggere la tua privacy. Questa Politica sulla Privacy spiega come raccogliamo, usiamo, divulghiamo e proteggiamo le tue informazioni quando visiti il nostro sito web example.com e usi i nostri servizi.',
    'privacy.infoCollect.title': 'Informazioni che Raccogliamo',
    'privacy.infoProvide.title': 'Informazioni che Vi Forniamo',
    'privacy.infoProvide.content': 'Informazioni di contatto quando ci contatti\nCommenti e suggerimenti che inviate\nInformazioni di iscrizione alla newsletter',
    'privacy.infoAuto.title': 'Informazioni Automaticamente Raccogliate',
    'privacy.infoAuto.content': 'Tipo e versione del browser\nInformazioni sul dispositivo\nPáginas visitadas y tiempo que pasa en nuestro sitio\nInformazioni sul sito di riferimento\nCookies e tecnologie di tracciamento simili',
    'privacy.howUse.title': 'Come Utilizziamo Le Tue Informazioni',
    'privacy.howUse.content': 'Fornire Servizi: Per operare e mantenere il nostro sito web e fornire informazioni su prodotti\nMigliorare l\'esperienza utente: Per analizzare i modelli di utilizzo e migliorare il nostro contenuto e l\'esperienza utente\nComunicazione: Per rispondere alle tue domande e inviare aggiornamenti importanti\nAnalisi: Per tracciare le prestazioni del sito web e l\'interazione degli utenti\nCumprimento Legale: Per conformarsi ai requisiti di legge e regolamentazione',
    'privacy.sharing.title': 'Condivisione delle Informazioni',
    'privacy.sharing.content': 'Non vendiamo, scambiamo o noleggiamo le tue informazioni personali. Potremmo condividere le informazioni in questi casi:\n\nPartners di Affiliazione: Quando clicchi sui link whop, potresti essere reindirizzato ai nostri partner di affiliazione\nFournisseurs de Services: Con servizi di terze parti fidate che ci aiutano a operare il nostro sito web\nRequisiti Legais: Quando richiesto dalla legge o per proteggere i nostri diritti\nTrasferimenti di Impresa: In connessione con una fusione, vente o trasferimento di attività',
    'privacy.cookies.title': 'Cookies e Tracciamento',
    'privacy.cookies.content': 'Usiamo cookies e tecnologie simili per:\n\nRicordare le tue preferenze\nAnalizzare il traffico del sito web e il suo utilizzo\nFornire contenuti personalizzati\nTracciare le referenze di affiliazione\n\nPuoi controllare i cookies tramite le impostazioni del browser, ma disattivarli può influenzare la funzionalità del sito web.',
    'privacy.security.title': 'Sicurezza dei Dati',
    'privacy.security.content': 'Implementiamo misure di sicurezza adeguate per proteggere le tue informazioni, inclusa:\n\nCriptazione SSL per la trasmissione dei dati\nInfrastruttura di hosting sicura\nAggiornamenti regolari di sicurezza e monitoraggio\nAccesso limitato alle informazioni personali',
    'privacy.rights.title': 'I Tuoi Diritti',
    'privacy.rights.content': 'Hai il diritto di:\n\nAccedere alle tue informazioni personali\nCorreggere informazioni errate\nRichiedere la cancellazione delle tue informazioni\nRifiutare di partecipare a comunicazioni di marketing\nObjettare al trattamento delle tue informazioni',
    'privacy.contact.title': 'Contattaci',
    'privacy.contact.content': 'Se hai domande o preoccupazioni sulla nostra Politica sulla Privacy o sulle nostre pratiche di gestione dei dati, per favore contattaci:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Sito web: <a href="/it/contact">Modulo di contatto</a>',
    
    // Terms of Service Content
    'terms.title': 'Termini di Servizio',
    'terms.agreement.title': 'Accordo sui Termini di Servizio',
    'terms.agreement.content': 'Accedendo e utilizzando Digital Promo Codes ("noi," "nostro," o "nostro"), accetti e accetti di essere vincolato ai termini e disposizioni di questo accordo. Se non accetti quanto sopra, per favore non utilizzare questo servizio.',
    'terms.license.title': 'Licenza di Utilizzo',
    'terms.license.content': 'È concessa la licenza per scaricare temporaneamente una copia dei materiali su Digital Promo Codes solo per la visione personale, non commerciale, transitoria. Questo è il conferimento di una licenza, non una trasferimento di titolo, e sotto questa licenza non è consentito:\n\nModificare o copiare i materiali\nUtilizzare i materiali per qualsiasi scopo commerciale o pubblico\nProvare a invertire l\'ingegneria inversa del software contenuto nel sito web\nRimuovere qualsiasi nota di proprietà intellettuale o altra',
    'terms.disclaimer.title': 'Rinuncia',
    'terms.disclaimer.content': 'Precisione delle Informazioni: I materiali su Digital Promo Codes sono forniti "così come sono". Non garantiamo esplicitamente o implicitamente alcuna garanzia.\nServizi di Terze Parti: Non siamo responsabili per il contenuto, le politiche o le pratiche di siti web whop a cui ci siamo collegati.\nDisponibilità delle Promozioni: Le promozioni e gli sconti whop sono soggetti a modifiche senza preavviso. Non garantiamo la disponibilità o i termini di qualsiasi offerta promozionale.',
    'terms.responsible.title': 'Utilizzo Responsabile',
    'terms.responsible.content': 'Digital Promo Codes promuove l\'utilizzo responsabile di prodotti e servizi digitali. Incoraggiamo gli utenti a:\n\nAcquistare solo prodotti e servizi che possono permettersi\nIndagare sui prodotti attentamente prima di acquistare\nLeggere attentamente i termini e le condizioni dei prodotti whop\nEntrare in contatto direttamente con i fornitori whop per il supporto del prodotto\n\nSe hai preoccupazioni su un prodotto o servizio whop, per favore entra in contatto direttamente con il fornitore o comunica con noi attraverso il nostro modulo di contatto.',
    'terms.contactInfo.title': 'Informazioni di Contatto',
    'terms.contactInfo.content': 'Se hai domande o preoccupazioni su questi Termini di Servizio, per favore contattaci:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Sito web: <a href="/it/contact">Modulo di contatto</a>',
    
    // Contact
    'contact.title': 'Contattaci',
    'contact.subtitle': 'Mettiti in contatto con il nostro team',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.subject': 'Oggetto',
    'contact.message': 'Messaggio',
    'contact.send': 'Invia Messaggio',
    'contact.sendMessage': 'Inviaci un Messaggio',
    'contact.getInTouch': 'Mettiti in Contatto',
    'contact.backToHome': 'Torna a Home',
    'contact.faqTitle': 'Domande Frequenti',
    'contact.faq1Question': 'Come posso reclamare una promozione?',
    'contact.faq1Answer': 'Clicca sul bottone "Ottieni Promo" su una carta whop per essere reindirizzato al whop. Siga il loro processo di registrazione e usa qualsiasi codice promozionale fornecido.',
    'contact.faq2Question': 'São elas legítimas?',
    'contact.faq2Answer': 'Sim, só mostramos promos de whops verificados e confiáveis. Todas as ofertas são verificadas e atualizadas regularmente.',
    'contact.faq3Question': 'Oferece suporte ao cliente para problemas whop?',
    'contact.faq3Answer': 'Fornecemos informações sobre promos, mas para problemas de conta ou produto, você precisará entrar em contato diretamente com o whop.',
    'contact.successMessage': 'Obrigado pela sua mensagem! Entraremos em contato dentro de 24 horas.',
    'contact.errorMessage': 'Houve um erro ao enviar sua mensagem. Tente novamente ou entre em contato conosco diretamente.',
    'contact.emailSupport': 'Suporte por Email',
    'contact.emailSupportDesc': 'Para consultas gerais e suporte',
    'contact.businessInquiries': 'Consultas Comerciais',
    'contact.businessInquiriesDesc': 'Para parcerias e oportunidades comerciais',
    'contact.responseTime': 'Tempo de Resposta',
    'contact.responseTimeDesc': 'Normalmente respondemos dentro de 24 horas durante os dias úteis',
    
    // Common
    'common.loading': 'Caricamento...',
    'common.error': 'Erro',
    'common.success': 'Successo',
    'common.close': 'Chiudi',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.about': 'Sobre Nós',
    'nav.contact': 'Contato',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.title': 'Digital Promo Codes - Promoções Premium de Produtos Digitais',
    'home.subtitle': 'Descubra códigos promocionais exclusivos e ofertas para os melhores produtos digitais',
    'home.cta': 'Navegar Ofertas',
    'home.filterCodes': 'Filtrar Códigos',
    'home.featured': 'Ofertas em Destaque',
    'home.statistics': 'Estatísticas da Plataforma',
    'home.noResults': 'Nenhum código promocional encontrado que corresponda aos seus filtros. Tente alterar seus critérios de filtro.',
    'home.expertReviews': 'Avaliações de Especialistas',
    'home.expertReviewsDesc': 'Nossa equipe testa minuciosamente cada produto digital e código promocional para garantir que você obtenha as melhores ofertas com valor genuíno e acesso.',
    'home.exclusiveAccess': 'Acesso Exclusivo',
    'home.exclusiveAccessDesc': 'Obtenha códigos promocionais especiais e descontos exclusivos que você não encontrará em nenhum outro lugar, negociados exclusivamente para nossa comunidade.',
    'home.alwaysUpdated': 'Sempre Atualizado',
    'home.alwaysUpdatedDesc': 'Nosso banco de dados de códigos promocionais é atualizado diariamente para garantir que todas as ofertas sejam atuais, ativas e forneçam o máximo valor aos usuários.',
    'home.readyToSave': 'Pronto para economizar dinheiro? Navegue pelos nossos produtos mais bem avaliados acima e comece a acessar conteúdo premium hoje.',
    
    // Statistics
    'stats.users': 'Usuários Totais',
    'stats.whops': 'Ofertas Ativas',
    'stats.codes': 'Códigos Promocionais',
    'stats.claimed': 'Códigos Promocionais Resgatados',
    'stats.popular': 'Mais Popular',
    
    // Whop Cards
    'whop.viewDeal': 'Resgatar Promo',
    'whop.revealCode': 'Revelar Código',
    'whop.goToOffer': 'Ir para Oferta',
    'whop.noCodeDisclosure': 'Nenhum código necessário – oferta aplicada automaticamente',
    'whop.noCode': 'Criador não permite códigos promocionais no momento',
    'whop.yourCode': 'Seu código',
    'whop.offerOpenedInTab': 'Oferta aberta em nova aba',
    'whop.codeCopied': 'Código copiado!',
    'whop.getPromo': 'Ir para Curso',
    
    // Whop Page
    'whop.promoCode': 'Código Promocional',
    'whop.howToRedeem': 'Como Usar',
    'whop.productDetails': 'Detalhes do Produto',
    'whop.about': 'Sobre',
    'whop.promoDetails': 'Detalhes da Promoção',
    'whop.termsConditions': 'Termos e Condições',
    'whop.faq': 'Perguntas Frequentes',
    'whop.website': 'Site',
    'whop.discountValue': 'Valor do Desconto',
    'whop.price': 'Preço',
    'whop.category': 'Categoria',
    'whop.offer': 'OFERTA',
    'whop.discount': 'DESCONTO',
    'whop.noPromoAvailable': 'Nenhuma promoção disponível',
    'whop.varies': 'Varía',
    
    // How to Redeem Steps
    'whop.step1': 'Clique no botão "{button}" para acessar {name}',
    'whop.step2Code': 'Copie o código promocional revelado',
    'whop.step2NoCode': 'Nenhum código necessário - desconto aplicado automaticamente',
    'whop.step3': 'Complete seu registro ou compra',
    'whop.step4': 'Aproveite seu {promo}!',
    
    // FAQ 
    'whop.faqQ1': 'Como usar este promo {name}?',
    'whop.faqA1': 'Para usar o promo {promo} para {name}, clique no botão "{button}" acima.',
    'whop.faqA1Code': ' Copie o código e cole durante o checkout.',
    'whop.faqA1NoCode': ' O desconto será aplicado automaticamente quando você acessar o link.',
    'whop.faqQ2': 'Que tipo de serviço é {name}?',
    'whop.faqA2': '{name} é {category} soluções especializadas para seus usuários.',
    'whop.faqA2Category': 'na categoria {category} e fornece',
    'whop.faqA2NoCategory': 'um serviço exclusivo que fornece',
    'whop.faqQ3': 'Por quanto tempo é válido este desconto?',
    'whop.faqA3': 'A validade do promo varia. Por favor, consulte o site do {name} para as informações mais recentes sobre datas de validade e termos.',
    
    // Terms & Conditions
    'whop.termsText': 'Este {oferta} é válido para {name} e está sujeito a seus termos e condições gerais. O desconto pode ser limitado no tempo e disponibilidade. Por favor, consulte o site do {name} para os termos e condições mais recentes.',
    'whop.termsOffer': 'código promocional "{code}"',
    'whop.termsOfferNoCode': 'oferta',
    
    // Footer
    'footer.description': 'Sua fonte confiável para promoções premium de produtos digitais e ofertas esclusivas.',
    'footer.quickLinks': 'Links Rápidos',
    'footer.legal': 'Legal',
    'footer.privacy': 'Política de Privacidade',
    'footer.terms': 'Termos de Serviço',
    'footer.rights': 'Todos os direitos reservados.',
    
    // Legal Pages
    'legal.backToHome': 'Voltar para Home',
    'legal.lastUpdated': 'Última atualização',
    
    // Privacy Policy Content
    'privacy.title': 'Política de Privacidade',
    'privacy.introduction.title': 'Introdução',
    'privacy.introduction.content': 'Digital Promo Codes ("nós," "nosso," ou "nosso") se compromete em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site example.com e usa nossos serviços.',
    'privacy.infoCollect.title': 'Informações que Coletamos',
    'privacy.infoProvide.title': 'Informações que Você Nos Fornece',
    'privacy.infoProvide.content': 'Informações de contato ao entrar em contato conosco\nComentários e sugestões que você envia\nInformações de assinatura de newsletter',
    'privacy.infoAuto.title': 'Informações Automaticamente Coletadas',
    'privacy.infoAuto.content': 'Tipo e versão do navegador\nInformações do dispositivo\nPáginas visitadas e tempo gasto no nosso site\nInformações do site de referência\nCookies e tecnologias de rastreamento semelhantes',
    'privacy.howUse.title': 'Como Usamos Suas Informações',
    'privacy.howUse.content': 'Fornecer Serviços: Para operar e manter nosso site web e fornecer informações sobre produtos\nMelhorar Experiência: Para analisar padrões de uso e melhorar nosso conteúdo e experiência de usuário\nComunicação: Para responder a suas perguntas e enviar atualizações importantes\nAnálise: Para rastrear o desempenho do site web e a interação dos usuários\nCumprimento Legal: Para cumprir com as leis e regulamentos aplicáveis',
    'privacy.sharing.title': 'Compartilhamento de Informações',
    'privacy.sharing.content': 'Não vendemos, trocamos ou noleggamos suas informações pessoais. Potremmo condividere informazioni in questi casi:\n\nPartners di Affiliazione: Quando você clica em links whop, pode ser redirecionado para nossos partners di affiliazione\nProvider di Servizi: Con serviços de terceiros de confiança que nos ajudam a operar nosso site web\nRequisitos Legais: Quando exigido dalla legge o per proteggere i nostri diritti\nTrasferimenti di Impresa: In connessione con una fusione, vendita o trasferimento di attività',
    'privacy.cookies.title': 'Cookies e Rastreamento',
    'privacy.cookies.content': 'Usiamo cookies e tecnologias semelhantes per:\n\nRicordare le tue preferenze\nAnalizzare il traffico del sito web e il suo utilizzo\nFornire contenuti personalizzati\nTracciare le referenze di affiliazione\n\nPuoi controllare i cookies tramite le impostazioni del browser, mas disattivarli può influenzare la funzionalità del sito web.',
    'privacy.security.title': 'Sicurezza dei Dati',
    'privacy.security.content': 'Implementiamo misure di sicurezza adeguate per proteggere as informações, inclusa:\n\nCriptografia SSL para transmissão de dados\nInfraestrutura de hospedagem segura\nAtualizações regulares de segurança e monitoramento\nAcesso limitado às informações pessoais',
    'privacy.rights.title': 'I Tuoi Diritti',
    'privacy.rights.content': 'Hai il diritto di:\n\nAccedere alle tue informazioni personali\nCorreggere informazioni errate\nRichiedere la cancellazione delle tue informazioni\nRifiutare di partecipare a comunicazioni di marketing\nObiettare al trattamento delle tue informazioni',
    'privacy.contact.title': 'Contattaci',
    'privacy.contact.content': 'Se hai domande o preoccupazioni sulla nostra Politica sulla Privacy o sulle nostre pratiche di gestione dei dati, per favore contattaci:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Sito web: <a href="/pt/contact">Modulo di contatto</a>',
    
    // Terms of Service Content
    'terms.title': 'Termini di Servizio',
    'terms.agreement.title': 'Accordo sui Termini di Servizio',
    'terms.agreement.content': 'Accedendo e utilizzando Digital Promo Codes ("noi," "nostro," o "nostro"), accetti e accetti di essere vincolato ai termini e disposizioni di questo accordo. Se non accetti quanto sopra, per favore non utilizzare questo servizio.',
    'terms.license.title': 'Licenza di Utilizzo',
    'terms.license.content': 'È concessa la licenza per scaricare temporaneamente una copia dei materiali su Digital Promo Codes solo per la visione personale, non commerciale, transitoria. Questo è il conferimento di una licenza, ke una trasferimento di titolo, e sotto questa licenza non è consentito:\n\nModificare o copiare i materiali\nUtilizzare i materiali per qualsiasi scopo commerciale o pubblico\nProvare a invertire l\'ingegneria inversa del software contenuto nel sito web\nRimuovere qualsiasi nota di proprietà intellettuale o altra',
    'terms.disclaimer.title': 'Rinuncia',
    'terms.disclaimer.content': 'Precisione delle Informazioni: I materiali su Digital Promo Codes sono forniti "così come sono". Non garantiamo esplicitamente o implicitamente alcuna garanzia.\nServizi di Terze Parti: Non siamo responsabili per il contenuto, le politiche o le pratiche di siti web whop a cui ci siamo collegati.\nDisponibilità delle Promozioni: Le promozioni e gli sconti whop sono basati su modifiche senza preavviso. Non garantiamo la disponibilità o i termini di qualsiasi offerta promozionale.',
    'terms.responsible.title': 'Utilizzo Responsabile',
    'terms.responsible.content': 'Digital Promo Codes promuove l\'utilizzo responsabile di prodotti e servizi digitali. Animiamo gli utenti a:\n\nAcquistare solo prodotti e servizi che possono permettersi\nIndagare sui prodotti attentamente prima di acquistare\nLeggere attentamente i termini e le condizioni dei prodotti whop\nEntrare in contatto direttamente con i fornitori whop per il supporto del prodotto\n\nSe hai preoccupazioni su un prodotto o servizio whop, per favore entra in contatto direttamente con il fornitore o comunica con noi attraverso il nostro modulo di contatto.',
    'terms.contactInfo.title': 'Informazioni di Contatto',
    'terms.contactInfo.content': 'Se hai domande o preoccupazioni su questi Termini di Servizio, per favore contattaci:<br><br>E-mail: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>Sito web: <a href="/pt/contact">Modulo di contatto</a>',
    
    // Contact
    'contact.title': 'Entre em Contato',
    'contact.subtitle': 'Entre em contato com nossa equipe',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.subject': 'Assunto',
    'contact.message': 'Mensagem',
    'contact.send': 'Enviar Mensagem',
    'contact.sendMessage': 'Envie-nos uma Mensagem',
    'contact.getInTouch': 'Entre em Contato',
    'contact.backToHome': 'Voltar para Home',
    'contact.faqTitle': 'Perguntas Frequentes',
    'contact.faq1Question': 'Como posso reivindicar uma promoção?',
    'contact.faq1Answer': 'Clique no botão "Obter Promoção" em uma carta whop para ser redirecionado para o whop. Siga o seu processo de registro e use qualquer código promocional fornecido.',
    'contact.faq2Question': 'São elas legítimas?',
    'contact.faq2Answer': 'Sim, só mostramos promos de whops verificados e confiáveis. Todas as ofertas são verificadas e atualizadas regularmente.',
    'contact.faq3Question': 'Oferece suporte ao cliente para problemas whop?',
    'contact.faq3Answer': 'Fornecemos informações sobre promos, mas para problemas de conta ou produto, você precisará entrar em contato diretamente com o whop.',
    'contact.successMessage': 'Obrigado pela sua mensagem! Entraremos em contato dentro de 24 horas.',
    'contact.errorMessage': 'Houve um erro ao enviar sua mensagem. Tente novamente ou entre em contato conosco diretamente.',
    'contact.emailSupport': 'Suporte por Email',
    'contact.emailSupportDesc': 'Para consultas gerais e suporte',
    'contact.businessInquiries': 'Consultas Comerciais',
    'contact.businessInquiriesDesc': 'Para parcerias e oportunidades comerciais',
    'contact.responseTime': 'Tempo de Resposta',
    'contact.responseTimeDesc': 'Normalmente respondemos dentro de 24 horas durante os dias úteis',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.close': 'Fechar',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',
    'nav.admin': '管理员',
    
    // Homepage
    'home.title': 'Digital Promo Codes - 高级数字产品促销',
    'home.subtitle': '发现最佳数字产品的独家促销代码和优惠',
    'home.cta': '浏览优惠',
    'home.filterCodes': '筛选代码',
    'home.featured': '精选优惠',
    'home.statistics': '平台统计',
    'home.noResults': '没有找到符合您筛选条件的促销代码。请尝试更改筛选条件。',
    'home.expertReviews': '专家评论',
    'home.expertReviewsDesc': '我们的团队仔细测试每个数字产品和促销代码，以确保您获得真正的价值和访问权限。',
    'home.exclusiveAccess': '独家访问',
    'home.exclusiveAccessDesc': '获取特殊促销代码和独家折扣，您不会在其他地方找到，独家为我们的社区协商。',
    'home.alwaysUpdated': '始终更新',
    'home.alwaysUpdatedDesc': '我们的促销代码数据库每天都会更新，以确保所有促销活动都是最新的、活跃的，并为用户提供最大价值。',
    'home.readyToSave': '准备好省钱吗？浏览我们上面最好的产品，今天就开始访问高级内容。',
    
    // Statistics
    'stats.users': '总用户数',
    'stats.whops': '活跃优惠s',
    'stats.codes': '促销代码',
    'stats.claimed': '已兑换促销代码',
    'stats.popular': '最受欢迎',
    
    // Whop Cards
    'whop.viewDeal': '兑换优惠',
    'whop.revealCode': '显示代码',
    'whop.goToOffer': '前往优惠',
    'whop.noCodeDisclosure': '无需代码 – 优惠自动应用',
    'whop.noCode': '创作者目前不允许促销代码',
    'whop.yourCode': '你的代码',
    'whop.offerOpenedInTab': '优惠已在新标签页中打开',
    'whop.codeCopied': '代码已复制！',
    'whop.getPromo': '前往课程',
    
    // Whop Page
    'whop.promoCode': '促销代码',
    'whop.howToRedeem': '如何使用',
    'whop.productDetails': '产品详情',
    'whop.about': '关于',
    'whop.promoDetails': '促销详情',
    'whop.termsConditions': '条款和条件',
    'whop.faq': '常见问题',
    'whop.website': '网站',
    'whop.discountValue': '折扣价值',
    'whop.price': '价格',
    'whop.category': '类别',
    'whop.offer': '优惠',
    'whop.discount': '折扣',
    'whop.noPromoAvailable': '没有可用的促销',
    'whop.varies': '变化',
    
    // How to Redeem Steps
    'whop.step1': '点击"{button}"按钮访问{name}',
    'whop.step2Code': '复制显示的促销代码',
    'whop.step2NoCode': '无需代码 - 折扣自动应用',
    'whop.step3': '完成注册或购买',
    'whop.step4': '享受您的{promo}！',
    
    // FAQ 
    'whop.faqQ1': '如何使用这个{name}促销？',
    'whop.faqA1': '要使用{promo}用于{name}，请点击上面的"{button}"按钮。',
    'whop.faqA1Code': '复制代码并在结账时使用。',
    'whop.faqA1NoCode': '折扣将自动应用于访问链接时。',
    'whop.faqQ2': '什么是{name}的服务？',
    'whop.faqA2': '{name}是为用户提供{category}专业解决方案的服务。',
    'whop.faqA2Category': '在{category}类别中并提供',
    'whop.faqA2NoCategory': 'um servizio esclusivo che fornisce',
    'whop.faqQ3': '这个折扣有效期有多长？',
    'whop.faqA3': '促销有效期可能会有所不同。请检查{name}的网站，了解有关到期日期和条款的最新信息。',
    
    // Terms & Conditions
    'whop.termsText': '此{offer}适用于{name}并受其一般条款和条件约束。折扣可能有时限和可用性。请检查{name}的网站，了解最新的条款和条件。',
    'whop.termsOffer': '促销代码"{code}"',
    'whop.termsOfferNoCode': '优惠',
    
    // Footer
    'footer.description': '您值得信赖的高级数字产品促销和独家优惠来源。',
    'footer.quickLinks': '快速链接',
    'footer.legal': '法律',
    'footer.privacy': '隐私政策',
    'footer.terms': '服务条款',
    'footer.rights': '版权所有。',
    
    // Legal Pages
    'legal.backToHome': '返回首页',
    'legal.lastUpdated': '最后更新',
    
    // Privacy Policy Content
    'privacy.title': '隐私政策',
    'privacy.introduction.title': '介绍',
    'privacy.introduction.content': 'Digital Promo Codes ("我们," "我们的," 或 "我们的") 致力于保护您的隐私。本隐私政策解释了我们如何收集、使用、披露和保护您的信息，当您访问我们的网站 example.com 并使用我们的服务时。',
    'privacy.infoCollect.title': '我们收集的信息',
    'privacy.infoProvide.title': '您提供的信息',
    'privacy.infoProvide.content': '联系我们时提供的联系信息\n您提交的评论和建议\n新闻通讯订阅信息',
    'privacy.infoAuto.title': '自动收集的信息',
    'privacy.infoAuto.content': '浏览器类型和版本\n设备信息\n访问的页面和在网站上的时间\n参考网站信息\nCookies和类似的跟踪技术',
    'privacy.howUse.title': '我们如何使用您的信息',
    'privacy.howUse.content': '提供服务：为了运营和维护我们的网站并提供 产品信息\n改进体验：为了分析使用模式并改进我们的内容和用户体验\n沟通：为了回答您的问题并发送重要更新\n分析：为了跟踪网站性能和用户参与度\n遵守法律：为了遵守适用法律和法规',
    'privacy.sharing.title': '信息共享',
    'privacy.sharing.content': '我们不会出售、交换或出租您的个人信息。在以下情况下，我们可能会共享信息：\n\n联盟伙伴：当您点击 whop 链接时，您可能会被重定向到我们的联盟伙伴\n服务提供商：与帮助我们运营网站的可信第三方服务\n法律要求：当法律要求或为了保护我们的权利时\n业务转让：在合并、出售或资产转让的背景下',
    'privacy.cookies.title': 'Cookies 和跟踪',
    'privacy.cookies.content': '我们使用 Cookies 和类似的跟踪技术来：\n\n记住您的偏好\n分析网站流量和使用情况\n提供个性化内容\n跟踪联盟推荐\n\n您可以通过浏览器设置控制 Cookies，但禁用它们可能会影响网站功能。',
    'privacy.security.title': '数据安全',
    'privacy.security.content': '我们实施了适当的安全措施来保护您的信息，包括：\n\nSSL 加密用于数据传输\n安全托管基础设施\n定期安全更新和监控\n限制对个人信息的访问',
    'privacy.rights.title': '您的权利',
    'privacy.rights.content': '您有权：\n\n访问您的个人信息\n纠正不准确的信息\n请求删除您的信息\n退出营销通信\n反对处理您的信息',
    'privacy.contact.title': '联系我们',
    'privacy.contact.content': '如果您对我们的隐私政策或数据实践有任何问题或关注，请随时与我们联系:<br><br>电子邮件: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>网站: <a href="/zh/contact">联系表单</a>',
    
    // Terms of Service Content
    'terms.title': '服务条款',
    'terms.agreement.title': '服务条款协议',
    'terms.agreement.content': '通过访问和使用 Digital Promo Codes ("我们," "我们的," 或 "我们的"), 您同意并同意受本协议的条款和条件的约束。如果您不同意上述内容，请不要使用此服务。',
    'terms.license.title': '使用许可',
    'terms.license.content': '已授予临时下载 Digital Promo Codes 上的材料副本的许可，仅供个人、非商业性临时查看。这是许可，不是转让标题，并且在此许可下，您不得：\n\n修改或复制材料\n将材料用于任何商业目的或公共显示\n尝试反向工程网站上包含的任何软件\n从材料中删除任何知识产权或其他',
    'terms.disclaimer.title': '免责声明',
    'terms.disclaimer.content': '信息准确性: 材料在 "按原样" 基础上提供。我们不提供任何明示或暗示的保证。\n第三方服务: 我们不对链接的第三方 whop 网站的内容、政策或实践负责。\n促销可用性: 促销和 whop 折扣可能会无通知更改。我们不保证任何促销优惠的可用性或条款。',
    'terms.responsible.title': '负责任使用',
    'terms.responsible.content': 'Digital Promo Codes 促进数字产品和服务的负责任使用。我们鼓励用户：\n\n仅购买他们可以负担的产品和服务\n在购买前彻底研究产品\n仔细阅读 whop 产品的条款和条件\n直接联系 whop 提供商以获取产品支持\n\n如果您对任何 whop 产品或服务有任何关注或关注，请直接联系提供商或通过我们的联系表单与我们联系。',
    'terms.contactInfo.title': '联系信息',
    'terms.contactInfo.content': '如果您对这些服务条款有任何问题，请与我们联系:<br><br>电子邮件: <a href="mailto:digitalpromocodes@gmail.com">digitalpromocodes@gmail.com</a><br>网站: <a href="/zh/contact">联系表单</a>',
    
    // Contact
    'contact.title': '联系我们',
    'contact.subtitle': '与我们的团队取得联系',
    'contact.name': '姓名',
    'contact.email': '邮箱',
    'contact.subject': '主题',
    'contact.message': '消息',
    'contact.send': '发送消息',
    'contact.sendMessage': '给我们发送消息',
    'contact.getInTouch': '取得联系',
    'contact.backToHome': '返回首页',
    'contact.faqTitle': '常见问题',
    'contact.faq1Question': '如何申请促销？',
    'contact.faq1Answer': '点击whop卡片上的"获取促销"按钮，将被重定向到whop。按照他们的注册流程并使用提供的任何促销代码。',
    'contact.faq2Question': '这些促销是合法的吗？',
    'contact.faq2Answer': '是的，我们只展示来自经过验证和信誉良好的whops的促销。所有优惠都经过验证并定期更新。',
    'contact.faq3Question': '您为whop问题提供客户支持吗？',
    'contact.faq3Answer': '我们提供有关促销的信息，但对于账户或产品问题，您需要直接联系whop。',
    'contact.successMessage': '感谢您的消息！我们将在24小时内回复您。',
    'contact.errorMessage': '发送消息时出错。请重试或直接联系我们。',
    'contact.emailSupport': '邮箱支持',
    'contact.emailSupportDesc': '一般咨询和支持',
    'contact.businessInquiries': '商务咨询',
    'contact.businessInquiriesDesc': '合作伙伴关系和商业机会',
    'contact.responseTime': '响应时间',
    'contact.responseTimeDesc': '我们通常在工作日24小时内回复',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.close': '关闭',
  }
};

// Simple and reliable translation function
export function getTranslation(key: string, language: Language = defaultLanguage): string {
  try {
    // Ensure we have a valid language
    const lang = language && translations[language] ? language : defaultLanguage;
    
    // Get the translation object for the language
    const langTranslations = translations[lang];
    
    // Direct key lookup (most common case)
    if (langTranslations[key]) {
      return langTranslations[key];
    }
    
    // Nested key lookup (e.g., 'nav.home')
    const keys = key.split('.');
    let value: any = langTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }
    
    // If we found a valid translation, return it
    if (typeof value === 'string') {
      return value;
    }
    
    // Fallback to English if not found and we're not already using English
    if (lang !== defaultLanguage) {
      const englishTranslations = translations[defaultLanguage];
      
      // Direct key lookup in English
      if (englishTranslations[key]) {
        return englishTranslations[key];
      }
      
      // Nested key lookup in English
      let englishValue: any = englishTranslations;
      for (const k of keys) {
        if (englishValue && typeof englishValue === 'object' && k in englishValue) {
          englishValue = englishValue[k];
        } else {
          englishValue = null;
          break;
        }
      }
      
      if (typeof englishValue === 'string') {
        return englishValue;
      }
    }
    
    // Last resort: return a readable version of the key
    return key.split('.').pop() || key;
  } catch (error) {
    console.error('Translation error:', error);
    return key.split('.').pop() || key;
  }
} 