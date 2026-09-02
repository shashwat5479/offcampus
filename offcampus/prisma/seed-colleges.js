const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COLLEGES = [
  { code: "IITM",   name: "IIT Madras" },
  { code: "IITD",   name: "IIT Delhi" },
  { code: "IITB",   name: "IIT Bombay" },
  { code: "IITK",   name: "IIT Kanpur" },
  { code: "IITKGP", name: "IIT Kharagpur" },
  { code: "IITR",   name: "IIT Roorkee" },
  { code: "IITG",   name: "IIT Guwahati" },
  { code: "BITS",   name: "BITS Pilani" },
  { code: "NITT",   name: "NIT Trichy" },
  { code: "NITK",   name: "NIT Karnataka (Surathkal)" },
  { code: "IIITH",  name: "IIIT Hyderabad" },
  { code: "IIITD",  name: "IIIT Delhi" },
  { code: "DTU",    name: "Delhi Technological University" },
  { code: "NSUT",   name: "Netaji Subhas University of Technology" },
  { code: "VIT",    name: "Vellore Institute of Technology" },
  { code: "SRM",    name: "SRM Institute of Science and Technology" },
  { code: "MIT",    name: "Manipal Institute of Technology" },
  { code: "NIET",   name: "Noida Institute of Engineering and Technology" },
  { code: "KIET",   name: "KIET Group of Institutions" },
  { code: "AKTU",   name: "Dr. A.P.J. Abdul Kalam Technical University" },
  { code: "GLA",    name: "GLA University" },
  { code: "AMITY",  name: "Amity University" },
  { code: "LPU",    name: "Lovely Professional University" },
  { code: "THAPAR", name: "Thapar Institute of Engineering and Technology" },
];

async function main() {
  const result = await prisma.college.createMany({
    data: COLLEGES,
    skipDuplicates: true, // safe to re-run; won't duplicate
  });
  console.log(`Added ${result.count} colleges (existing ones skipped).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());