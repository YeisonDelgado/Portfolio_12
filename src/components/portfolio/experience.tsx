"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const experienceItems = {
    "Univ. of Cauca": {
      jobTitle: "Academic Monitor @",
      duration: "APR 2025 - JUN 2025",
      desc: [
        "Delivered technical support for computer lab operations, network connectivity, and hardware maintenance.",
        "Supported students and staff in troubleshooting and optimizing IT resources.",
        "Ensured accurate documentation of technical procedures and reports."
      ]
    },
    Amazon: {
      jobTitle: "Software Development Engineer @",
      duration: "JUL 2022 - PRESENT",
      desc: [
        "Led development of end-to-end region build automation across Route 53 (AWS's DNS web service).  This enabled the launch of customer-facing global services in new regions within a day, a significant reduction from the previous time-frame of a month.",
        "Re-built Route 53's core domain management and DNS systems to provide a better user experience to millions of customers."
      ]
    },
    Wattpad: {
      jobTitle: "Associate Engineer @",
      duration: "MAY 2020 - APR 2021",
      desc: [
        "Developed a responsive React web page (the new Story Details) from scratch, both on client and server side, for an app with massive scale (2 billion daily requests).",
        "Iteratively built web experiences for 80 million users across high-traffic pages.",
        "Collaborated with senior engineers and product management following best practices for the full software development life cycle, including coding standards, code reviews, source control management, build processes, testing, and operations."
      ]
    },
    "University of Toronto": {
      jobTitle: "Research Engineer @",
      duration: "MAY 2021 - SEPT 2021",
      desc: [
        "Developed and researched an NLP-based framework using state-of-the-art tools like Spacy and Stanza to facilitate the derivation of requirements from health data by leveraging syntactic dependencies, entity-recognition and rule-based match-making.",
        "Application selected for DCS Research Award ($4,000) as part of the ”Visualizing Privacy Analysis Results” project led by Professor Marsha Chechik."
      ]
    },
    Centivizer: {
      jobTitle: "Software Developer @",
      duration: "SEPT 2019 - APR 2020",
      desc: [
        "Developed interactive and neural-activation technologies to stimulate physical and cognitive functions in order to slow the progression of neurodegenerative disorders.",
        "Leveraged WebRTC to develop and maintain a Node.js online video-streaming platform in real-time competitive-mode games to research the effects of active stimulation for those suffering from dementia."
      ]
    },
  };

export function Experience() {
  const jobKeys = Object.keys(experienceItems);

  return (
    <section id="experience" className="py-16 md:py-24">
      <h2 className="text-3xl font-bold text-center mb-12">
        Where I've Worked
      </h2>
      <Tabs defaultValue={jobKeys[0]} orientation="vertical" className="flex flex-col md:flex-row gap-8 md:gap-16">
        <TabsList className="w-full md:w-auto h-auto flex-row md:flex-col justify-start bg-transparent p-0">
          {jobKeys.map((key) => (
            <TabsTrigger 
              key={key} 
              value={key} 
              className="w-full justify-start text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 data-[state=active]:shadow-none"
            >
              {key}
            </TabsTrigger>
          ))}
        </TabsList>

        {jobKeys.map((key) => {
            const item = experienceItems[key as keyof typeof experienceItems];
            return (
                <TabsContent key={key} value={key} className="w-full mt-0">
                    <h3 className="text-xl font-bold">
                        <span>{item.jobTitle}</span>
                        <span className="text-primary"> {key}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">{item.duration}</p>
                    <ul className="space-y-2 list-disc pl-5 text-foreground/80">
                        {item.desc.map((descItem, i) => (
                            <li key={i}>{descItem}</li>
                        ))}
                    </ul>
                </TabsContent>
            )
        })}
      </Tabs>
    </section>
  );
};
