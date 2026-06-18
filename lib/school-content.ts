export const schoolContent = {
  name: "Sagar Middle School",
  motto: "Nurturing Tomorrow's Leaders",
  principal: "Principal — Dr. Rajesh Kumar",
  about: {
    mission:
      "Sagar Middle School is dedicated to providing a safe, inclusive environment where every student can discover their potential and develop a lifelong love of learning.",
    vision:
      "We envision graduates who are confident thinkers, compassionate citizens, and leaders ready to make a positive impact in their communities.",
    history:
      "Founded in 1998, Sagar Middle School has grown from a small neighborhood school into a vibrant learning community serving families across the region.",
  },
  stats: [
    { label: "Years of Excellence", value: "27+" },
    { label: "Students Enrolled", value: "850+" },
    { label: "Dedicated Teachers", value: "45+" },
    { label: "Programs Offered", value: "12+" },
  ],
  programs: [
    {
      title: "STEM Excellence",
      description:
        "Hands-on science, technology, engineering, and math labs that spark curiosity and build problem-solving skills.",
    },
    {
      title: "Arts & Culture",
      description:
        "Music, visual arts, and drama programs that nurture creativity and self-expression in every student.",
    },
    {
      title: "Sports & Wellness",
      description:
        "Competitive athletics and daily physical education to promote teamwork, discipline, and healthy habits.",
    },
    {
      title: "Character Education",
      description:
        "Leadership workshops and community service projects that build integrity, empathy, and civic responsibility.",
    },
  ],
  contact: {
    address: "123 Education Lane, Sagar Nagar, Maharashtra 431001",
    phone: "+91 98765 43210",
    email: "info@sagarmiddleschool.edu.in",
    hours: "Monday – Friday, 8:00 AM – 4:00 PM",
  },
  portalLinks: [
    { label: "Student", href: "/login/student" },
    { label: "Parent", href: "/login/parent" },
    { label: "Teacher", href: "/login/teacher" },
    { label: "Admin", href: "/login/admin" },
  ],
} as const;
