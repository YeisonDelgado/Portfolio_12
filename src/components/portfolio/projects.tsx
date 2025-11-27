"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, Folder } from 'lucide-react';

const projects = [
  {
    title: "No Man's Land",
    desc: "A third-person survival-mode game where you battle against time and space to return to Earth.",
    techStack: ["C#", "Unity"],
    githubLink: "https://github.com/slakh96/no-mans-land",
    openLink: "https://gazijarin.itch.io/no-mans-land",
  },
  {
    title: "Truth",
    desc: "A three.js simulation of the planet system revolving around a monolith.",
    techStack: ["JavaScript", "Three.js"],
    githubLink: "https://github.com/gazijarin/truth",
    openLink: "https://gazijarin.github.io/Truth/",
  },
  {
    title: "Tall Tales",
    desc: "A multi-player story-telling web game for 3-5 players, using sockets for concurrent gameplay.",
    techStack: ["Node.js", "Socket.io", "React", "MongoDB"],
    githubLink: "https://github.com/gazijarin/TallTales",
    openLink: "https://talltales.herokuapp.com/",
  },
  {
    title: "TDSB Homework Management",
    desc: "An application created for Toronto District School Board, with a Flask back-end and a Vue front-end.",
    techStack: ["Python", "Flask", "Vue.js", "SQL"],
    githubLink: "https://github.com/gazijarin/TDSBHomeworkManagement",
    openLink: "https://tdsb-app.herokuapp.com/",
  },
  {
    title: "Adam A.I.",
    desc: "A self-learning A.I. that learns to traverse through a complex maze using the genetic algorithm.",
    techStack: ["JavaScript", "HTML", "CSS"],
    githubLink: "https://github.com/gazijarin/adamai",
    openLink: "https://gazijarin.github.io/AdamAI/",
  },
  {
    title: "Game Centre",
    desc: "An Android app consisting of three board games, including multiplayer, autosave, and user authentication.",
    techStack: ["Java", "Android Studio"],
    githubLink: "https://github.com/gazijarin/gamecentre",
    openLink: "",
  },
];

export function Projects() {
  return (
    <section id="projects" className="py-16 md:py-24">
      <h2 className="text-3xl font-bold text-center mb-12">
        Things I've Built
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Card key={index} className="flex flex-col bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors duration-300">
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