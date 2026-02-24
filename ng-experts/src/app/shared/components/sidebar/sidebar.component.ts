import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <aside class="sidebar fixed left-0 top-0 h-screen border-r border-white/5 flex flex-col py-8 overflow-hidden shadow-2xl">
        <div class="w-full flex justify-center mb-20 text-white cursor-pointer">
            <i class="fa-solid fa-bars-staggered text-xl"></i>
        </div>
        <nav class="flex flex-col gap-8 w-full">
            <a routerLink="/" class="flex items-center w-full px-7 text-subtext group">
                <i class="fa-solid fa-house text-lg w-6 text-center"></i>
                <span class="sidebar-label font-medium uppercase text-[10px] tracking-widest">Dashboard</span>
            </a>
            <a routerLink="/experts" class="flex items-center w-full px-7 text-subtext group">
                <i class="fa-solid fa-magnifying-glass text-lg w-6 text-center"></i>
                <span class="sidebar-label font-medium uppercase text-[10px] tracking-widest">Explore</span>
            </a>
            <a href="#" class="flex items-center w-full px-7 text-subtext group">
                <i class="fa-solid fa-user-tie text-lg w-6 text-center"></i>
                <span class="sidebar-label font-medium uppercase text-[10px] tracking-widest">Experts</span>
            </a>
        </nav>
        <div class="mt-auto w-full flex justify-center opacity-20">
            <i class="fa-brands fa-x-twitter text-xl text-white"></i>
        </div>
    </aside>
  `,
    styles: [`
    .sidebar {
        width: 80px;
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 100;
        background-color: #050505;
    }
    .sidebar:hover { width: 260px; }
    .sidebar-label {
        opacity: 0;
        transition: opacity 0.3s ease;
        white-space: nowrap;
        margin-left: 1.5rem;
    }
    .sidebar:hover .sidebar-label { opacity: 1; }
  `]
})
export class Sidebar { }
