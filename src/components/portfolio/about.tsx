"use client";

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
      <div className="max-w-4xl mx-auto space-y-6 text-lg text-center">
        <div className="space-y-4 text-foreground/80">
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
        </div>
        <div className="space-y-4 pt-6">
          <h3 className="font-semibold text-xl text-foreground">Here are some technologies I have been working with:</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}