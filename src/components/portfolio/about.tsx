"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const techStack = [
  "TypeScript",
  "Python",
  "React.js",
  "Java",
  "JavaScript ES6+",
  "C#",
];

export function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <h2 className="text-3xl font-bold text-center mb-12">
        About Me
      </h2>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-foreground/80 text-lg">
          <p>
            I am currently a <b>Software Development Engineer</b> at{" "}
            <a href="https://www.aboutamazon.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Amazon
            </a>
            , working in the AWS sector under team Route 53. At the same time, I am
            undertaking a part-time <b>Master's of Science</b> in{" "}
            <b>Software Engineering</b> at the{" "}
            <a href="https://www.ox.ac.uk/about" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              University of Oxford
            </a>
            .
          </p>
          <p>
            Outside of work, I'm interested in following the developments of
            science. I also play a lot of video games. And make TikToks.
          </p>
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-xl text-foreground">Here are some technologies I have been working with:</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="relative h-80 w-full md:h-96 rounded-lg overflow-hidden group">
            <Image 
                src="https://picsum.photos/seed/aboutme/600/800"
                alt="About me"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 group-hover:scale-105"
            />
        </div>
      </div>
    </section>
  );
}
