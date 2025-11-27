"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const techStack = [
    "Python",
    "Java (Spring Boot)",
    "JavaScript",
    "Node.js",
    "React",
    "Terraform",
    "Docker",
    "Google Cloud",
    "CI/CD",
    "SQL",
    "NoSQL",
];

export function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <h2 className="text-3xl font-bold text-center mb-12">
        About Me
      </h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="md:col-span-2 space-y-6 text-lg">
          <div className="space-y-4 text-foreground/80 text-left">
            <p>
              Electronics and Telecommunications Engineering student at Universidad del Cauca,
              passionate about software development and scalable solutions. Hands-on experience with
              programming, cloud environment automation, and CI/CD workflows, applying agile
              practices to deliver results efficiently.
            </p>
            <p>
              I enjoy solving technical
              challenges creatively, testing and validating solutions to ensure quality and performance.
              Known for being proactive, results-oriented, adaptable, and committed to continuous
              learning.
            </p>
          </div>
          <div className="space-y-4 pt-6 text-left">
            <h3 className="font-semibold text-xl text-foreground">Here are some technologies I have been working with:</h3>
            <div className="flex flex-wrap gap-2 justify-start">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="relative w-full aspect-square rounded-lg overflow-hidden group">
            <Image
                src="https://storage.googleapis.com/aai-sit-studio-public-pro-1a39b36/4101e4a3-7647-49f3-8f0a-48d51a66e6c7"
                alt="Yeison Delgado"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                
            />
        </div>
      </div>
    </section>
  );
}
