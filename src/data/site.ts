export const site = {
  title: "Zhepei Wang",
  description: "Researcher working on machine learning for music, audio, and speech.",
  footerText: "San Francisco Bay Area",
  location: "San Francisco Bay Area",
  homepage: {
    name: "Zhepei Wang",
    profileImage: "/assets/images/profile_2026-03-20.jpg",
    roleLines: [
      "Researcher, Adobe Research",
      "MusicAI Group"
    ],
    emailLines: [
      "zhepeiw03 [at] gmail [dot] com",
      "zhepeiw [at] ieee [dot] org"
    ],
    socialLinks: [
      {
        label: "CV",
        href: "/assets/cv_2026-03-20.pdf",
        icon: "cv"
      },
      {
        label: "Google Scholar",
        href: "https://scholar.google.com/citations?user=L2ZJUD8AAAAJ",
        icon: "scholar"
      },
      {
        label: "GitHub",
        href: "https://github.com/zhepeiw",
        icon: "github"
      },
      {
        label: "X",
        href: "https://x.com/zhepeiw03",
        icon: "x"
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/zhepei-wang-b40295107/",
        icon: "linkedin"
      }
    ],
    intro: [
      "Hello! I am a researcher at the MusicAI Group of <a href=\"https://research.adobe.com/people/\" target=\"_blank\" rel=\"noreferrer\">Adobe Research</a>. My work focuses on machine learning for music, audio, and speech, including music and audio understanding, text-to-music generation, sound recognition, source separation, speech enhancement, and multimodal representation learning.",
      "Before joining Adobe, I was an applied scientist at Amazon Web Services (AWS) and also interned there several times, working on real-time speech enhancement, personalized audio processing, and enterprise search. I earned my Ph.D. in Computer Science from the University of Illinois Urbana-Champaign in 2023, advised by Paris Smaragdis. Prior to my Ph.D., I received my B.S. in Computer Science from Harvey Mudd College in 2018."
    ],
    selectedPublicationIds: [
      "CSSL",
      "metadata-captioning",
      "UPN",
      "Tzinis2020SudoR",
      "Wang1910:Continual"
    ]
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "Publications", href: "/publications/" }
  ],
  about: {
    title: "About",
    content: [
      "I build machine learning systems for audio and multimodal understanding, with a particular emphasis on music, speech, and generative modeling.",
      "Across academia and industry, I have worked on source separation, speech enhancement, audio-language representations, sound event detection, and music captioning. I enjoy research that connects strong modeling ideas with practical media tools."
    ]
  },
  contact: {
    title: "Contact",
    emails: [
      "zhepeiw03 [at] gmail [dot] com",
      "zhepeiw [at] ieee [dot] org"
    ],
    content:
      "I currently live in the Bay Area. Feel free to reach out by email if you'd like to chat about audio, machine learning, DSP, music, sports, coffee, or collaboration opportunities."
  }
} as const;
