"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';

const projects = [
  {
    title: "No Man's Land",
    desc: "A third-person survival-mode game where you battle against time and space to return to Earth.",
    techStack: ["C#", "Unity"],
    githubLink: "https://github.com/slakh96/no-mans-land",
    openLink: "https://gazijarin.itch.io/no-mans-land",
    image: "https://picsum.photos/seed/nomansland/600/400"
  },
  {
    title: "Truth",
    desc: "A three.js simulation of the planet system revolving around a monolith.",
    techStack: ["JavaScript", "Three.js"],
    githubLink: "https://github.com/gazijarin/truth",
    openLink: "https://gazijarin.github.io/Truth/",
    image: "https://picsum.photos/seed/truth/600/400"
  },
  {
    title: "Tall Tales",
    desc: "A multi-player story-telling web game for 3-5 players, using sockets for concurrent gameplay.",
    techStack: ["Node.js", "Socket.io", "React", "MongoDB"],
    githubLink: "https://github.com/gazijarin/TallTales",
    openLink: "https://talltales.herokuapp.com/",
    image: "https://picsum.photos/seed/talltales/600/400"
  },
  {
    title: "TDSB Homework Management",
    desc: "An application created for Toronto District School Board, with a Flask back-end and a Vue front-end.",
    techStack: ["Python", "Flask", "Vue.js", "SQL"],
    link: "https://github.com/gazijarin/TDSBHomeworkManagement",
    open: "https://tdsb-app.herokuapp.com/",
    image: "https://picsum.photos/seed/tdsb/600/400"
  },
  {
    title: "Adam A.I.",
    desc: "A self-learning A.I. that learns to traverse through a complex maze using the genetic algorithm.",
    techStack: ["JavaScript", "HTML", "CSS"],
    link: "https://github.com/gazijarin/adamai",
    open: "https://gazijarin.github.io/AdamAI/",
    image: "https://picsum.photos/seed/adamai/600/400"
  },
  {
    title: "Game Centre",
    desc: "An Android app consisting of three board games, including multiplayer, autosave, and user authentication.",
    techStack: ["Java", "Android Studio"],
    link: "https://github.com/gazijarin/gamecentre",
    open: "",
    image: "https://picsum.photos/seed/gamecentre/600/400"
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
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={project.image}
                  alt={project.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <CardTitle className="flex justify-between items-center">
                <span>{project.title}</span>
                <div className="flex gap-2">
                  {project.githubLink && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {project.openLink && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={project.openLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-muted-foreground mb-4 flex-grow">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
