/* SEO Enhancements and Structured Data */

// Inject structured data for better SEO
document.addEventListener('DOMContentLoaded', () => {
    // Add person schema
    injectPersonSchema();
    
    // Add website schema
    injectWebsiteSchema();
    
    // Add professional service schema
    injectProfessionalServiceSchema();
});

function injectPersonSchema() {
    // Create schema for the person
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Azhar Ali",
        "url": document.location.origin,
        "image": document.location.origin + "/images/logo.jpg",
        "sameAs": [
            "https://www.linkedin.com/in/azhar-ali-994242330",
            "https://github.com/AzharDayo"
        ],
        "jobTitle": "Professional Software Developer",
        "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
        },
        "description": "Professional Software Developer specializing in C++, Java, Python, and web technologies. Creating innovative solutions for modern challenges.",
        "email": "azharalidayo10@gmail.com",
        "telephone": "+923133610655",
        "knowsLanguage": ["English", "Urdu", "Sindhi"],
        "knowsAbout": [
            "Software Development",
            "Web Development",
            "Mobile App Development",
            "Desktop Applications",
            "Cybersecurity",
            "Python",
            "Java",
            "C++"
        ]
    };
    
    injectStructuredData(personSchema);
}

function injectWebsiteSchema() {
    // Create schema for the website
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": document.location.origin,
        "name": "Azhar Ali - Professional Software Developer",
        "description": "Portfolio website of Azhar Ali, a professional software developer specializing in C++, Java, Python and web technologies.",
        "author": {
            "@type": "Person",
            "name": "Azhar Ali"
        }
    };
    
    injectStructuredData(websiteSchema);
}

function injectProfessionalServiceSchema() {
    // Create schema for professional services
    const services = [
        {
            name: "Mobile App Development",
            description: "Custom mobile app development for Android and iOS using Flutter and native technologies.",
            image: document.location.origin + "/images/logo.jpg"
        },
        {
            name: "Web Development",
            description: "Modern web application development using React, Node.js, and other cutting-edge technologies.",
            image: document.location.origin + "/images/logo.jpg"
        },
        {
            name: "Desktop Applications",
            description: "Cross-platform desktop application development using Java, C++, and Python.",
            image: document.location.origin + "/images/logo.jpg"
        },
        {
            name: "Custom Software Solutions",
            description: "Tailored software solutions to meet specific business needs and requirements.",
            image: document.location.origin + "/images/logo.jpg"
        }
    ];
    
    services.forEach(service => {
        const serviceSchema = {
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": service.name,
            "name": service.name,
            "description": service.description,
            "provider": {
                "@type": "Person",
                "name": "Azhar Ali"
            },
            "image": service.image
        };
        
        injectStructuredData(serviceSchema);
    });
}

function injectStructuredData(schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}