"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Folder } from 'lucide-react';

const projects = [
  {
    title: "VitaMind",
    desc: "Stress detection system using Galvanic Skin Response (GSR) signals, with a mobile UI and a Python/Flask machine learning model for prediction.",
    techStack: ["Python", "Flask", "Machine Learning", "Android"],
    githubLink: "https://github.com/YeisonDelgado/VitaMind_App2",
    openLink: "",
  },
  {
    title: "Containerized Email Services",
    desc: "A containerized email stack with Postfix, Amavis, and Dovecot in Docker Compose, implementing content filtering and spam tagging.",
    techStack: ["Docker", "Docker Compose", "Postfix", "Amavis"],
    githubLink: "https://github.com/YeisonDelgado/Email-Services-with-Docker",
    openLink: "",
  },
  {
    title: "eMBB Services in NGN/IMS",
    desc: "Led a team to implement enhanced mobile broadband (eMBB) services within an NGN/IMS architecture, including an AI chatbot and mobility management.",
    techStack: ["NGN", "IMS", "AI", "Mobile Networks"],
    githubLink: "",
    openLink: "",
  },
  {
    title: "Portfolio",
    desc: "An interactive portfolio built with Next.js and Three.js within Firebase Studio, showcasing hands-on projects and creative UI experiences.",
    techStack: ["Next.js", "Three.js", "Firebase", "JavaScript"],
    githubLink: "https://github.com/YeisonDelgado/portfolio_12",
    openLink: "",
  },
  {
    title: "Controlador Ryu — SDN Project",
    desc: "A multi-plane SDN project implementing Forwarding (NSFNET topology with Mininet), Control (Ryu controller), Application (Dijkstra routing with NetworkX), and Management (FastAPI + UI) planes for network experimentation.",
    techStack: ["Python", "Ryu", "Mininet", "FastAPI", "NetworkX"],
    githubLink: "https://github.com/YeisonDelgado/Ryu_Controller_v1",
    openLink: "",
  },
  {
    title: "Security System 12",
    desc: "Final design of a security system using PIC16F887 microcontroller, including sensors, keypad, LCD interface, and comprehensive Doxygen documentation.",
    techStack: ["C", "Assembly", "HTML", "JavaScript", "PIC16F887"],
    githubLink: "https://github.com/YeisonDelgado/SecuritySystem_12",
    openLink: "",
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-16 md:py-24 px-4 md:px-12 lg:px-24">
      <h2 className="text-3xl font-bold text-center mb-12">
        Things I've Built
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Card key={index} className="flex flex-col bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors duration-300 max-w-sm mx-auto">
            <CardHeader className="relative">
              <div className="flex justify-between items-start">
                <Folder className="h-8 w-8 text-primary" />
                <div className="flex gap-2">
                  {project.githubLink && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {project.openLink && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={project.openLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <CardTitle className="mb-2 text-xl">{project.title}</CardTitle>
              <p className="text-muted-foreground mb-4 flex-grow">{project.desc}</p>
              <div className="flex flex-wrap gap-2 pt-4">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
