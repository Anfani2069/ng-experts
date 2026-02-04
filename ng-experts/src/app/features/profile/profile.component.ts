import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  status: 'active' | 'inactive';
  role: string;
  phone: string;
  email: string;
  skype: string;
  location: string;
  education: string;
  language: string;
  stats: {
    members: number;
    projects: number;
    sales: number;
  };
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Profile {
  protected readonly activeTab = signal('profile');
  protected readonly postContent = signal('');
  
  protected readonly profile = signal<ExpertProfile>({
    id: '1',
    name: 'Mike Nielsen',
    title: 'Senior Angular Developer',
    description: 'Dream big. Think different. Do great!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'active',
    role: 'Expert',
    phone: '(123) 456-7890',
    email: 'mike.nielsen@ng-expert.com',
    skype: 'mike.nielsen',
    location: 'Paris, France - 75001',
    education: 'École Polytechnique',
    language: 'French, English',
    stats: {
      members: 120,
      projects: 42,
      sales: 780
    }
  });

  constructor(private route: ActivatedRoute) {
    // TODO: Load profile from route params
    // const profileId = this.route.snapshot.paramMap.get('id');
  }

  protected onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  protected onPostContentChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.postContent.set(target.value);
  }

  protected onEditProfile(): void {
    // TODO: Navigate to edit profile page
    console.log('Edit profile');
  }

  protected onAddPhoto(): void {
    // TODO: Implement photo upload
    console.log('Add photo');
  }

  protected onAddArticle(): void {
    // TODO: Implement article creation
    console.log('Add article');
  }

  protected onPost(): void {
    if (this.postContent().trim()) {
      // TODO: Implement post creation
      console.log('Post:', this.postContent());
      this.postContent.set('');
    }
  }
}
