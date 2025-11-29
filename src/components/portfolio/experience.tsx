"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const experienceItems = {
  "University of Cauca 2025.1": {
    jobTitle: "Academic Monitor @",
    duration: "APR 2025 - JUN 2025",
    desc: [
      "Delivered technical support for computer lab operations, network connectivity, and hardware maintenance.",
      "Supported students and staff in troubleshooting and optimizing IT resources.",
      "Ensured accurate documentation of technical procedures and reports."
    ]
  },
  "University of Cauca 2025.2": {
    jobTitle: "Academic Monitor @",
    duration: "OCT 2025 - DEC 2025 (1st week)",
    desc: [
      "Reviewed computer equipment across multiple university campuses to ensure software is up-to-date, including antivirus programs, and properly registered in the university database.",
      "Assisted users with questions about their devices or general IT issues.",
      "Worked collaboratively in a team, contributing to leadership and shared responsibilities."
    ]
  },
  "Personal Projects": {
    jobTitle: "Software Development & Cybersecurity Projects",
    duration: "ONGOING",
    desc: [
      "Developed personal software projects to strengthen hands-on programming skills in Python, JavaScript, Java, and cloud technologies.",
      "Completed multiple certifications in software development, cybersecurity, and ethical hacking to expand technical knowledge and practical expertise.",
      "Applied learned skills in small-scale projects, CI/CD workflows, and security practices."
    ]
  }
} as const;

export function Experience() {
  const jobKeys = Object.keys(experienceItems);
  const [activeTab, setActiveTab] = React.useState(jobKeys[0]);

  return (
    <section id="experience" className="py-32 px-6 md:px-12 max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold text-center mb-32 tracking-tight">
        Where I've Worked
      </h2>

      <Tabs
        defaultValue={jobKeys[0]}
        onValueChange={(v) => setActiveTab(v)}
        orientation="vertical"
        className="relative grid grid-cols-[auto_30px_1fr] gap-16"
      >
        {/* COLUMNA 1: TABS LIST */}
        <TabsList className="w-full md:w-56 flex-row md:flex-col bg-transparent p-0">
          {jobKeys.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="w-full justify-start py-3 text-left 
               text-muted-foreground 
               data-[state=active]:text-primary 
               data-[state=active]:bg-primary/10"
            >
              {key}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* COLUMNA 2: LÍNEA + PUNTO */}
        <div className="hidden md:flex flex-col items-center relative -mt-20">
          <div className="w-[6px] h-[200px] bg-primary/20 rounded-full" />

          <div
            className="absolute w-4 h-4 bg-primary rounded-full shadow-md transition-all duration-300"
            style={{
              top: `${jobKeys.indexOf(activeTab) * 100}px`,
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* COLUMNA 3: CONTENIDO */}
        <div className="flex-1 -mt-24">
          {jobKeys.map((key) => {
            const item = experienceItems[key as keyof typeof experienceItems];

            return (
              <TabsContent key={key} value={key} className="animate-fadeIn">
                <h3 className="text-xl font-bold">
                  <span>{item.jobTitle}</span>
                  <span className="text-primary"> {key}</span>
                </h3>

                <p className="text-sm48 text-muted-foreground mt-1 mb-4">
                  {item.duration}
                </p>

                <ul className="space-y-2 list-disc pl-5 text-foreground/80">
                  {item.desc.map((point, i) => (
                    <li
                      key={i}
                      className="fadeItem"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </section>
  );
}
