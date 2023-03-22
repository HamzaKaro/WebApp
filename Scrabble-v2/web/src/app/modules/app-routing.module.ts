import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/auth.guard';
import { SignUpPageComponent } from '@app/components/sign-up-page/sign-up-page.component';
// import { AdminBotPageComponent } from '@app/pages/admin-bot-page/admin-bot-page.component';
// import { AdminDictionariesPageComponent } from '@app/pages/admin-dictionaries-page/admin-dictionaries-page.component';
// import { AdminGamesPageComponent } from '@app/pages/admin-games-page/admin-games-page.component';
// import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';
import { ConnexionsHistoryComponent } from '@app/pages/connexions-history/connexions-history.component';
import { AdminComponent } from './../pages/admin/admin.component';
import { BlogListComponent } from './../pages/blog/blog-list/blog-list.component';
import { BlogPostComponent } from './../pages/blog/blog-post/blog-post.component';
import { CreatePostComponent } from './../pages/blog/create-post/create-post.component';
import { EditPostComponent } from './../pages/blog/edit-post/edit-post.component';
// import { BestScoresPageComponent } from '@app/pages/best-scores-page/best-scores-page.component';
import { AdminBlogListComponent } from '@app/pages/blog/admin-blog-list/admin-blog-list.component';
import { GameCreateMultiplayerPageComponent } from '@app/pages/game-create-multiplayer-page/game-create-multiplayer-page.component';
import { GameJoinMultiplayerPageComponent } from '@app/pages/game-join-multiplayer-page/game-join-multiplayer-page.component';
import { GameOptionPageComponent } from '@app/pages/game-option-page/game-option-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameWaitMultiplayerPageComponent } from '@app/pages/game-wait-multiplayer-page/game-wait-multiplayer-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ObserverPageComponent } from '@app/pages/observer-page/observer-page.component';
import { StatisticsPageComponent } from '@app/pages/statistics-page/statistics-page.component';
import { UserAccountPageComponent } from '@app/pages/user-account-page/user-account-page.component';
import { VirtualStorePageComponent } from '@app/pages/virtual-store-page/virtual-store-page.component';
import { WaitingRoomFriendComponent } from '@app/waiting-room-friend/waiting-room-friend.component';
// import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'game', component: GamePageComponent },
    { path: 'observe', component: ObserverPageComponent },
    { path: 'game/option', component: GameOptionPageComponent },
    { path: 'game/multiplayer/create/:mode', component: GameCreateMultiplayerPageComponent },
    { path: 'game/multiplayer/join', component: GameJoinMultiplayerPageComponent },
    { path: 'game/multiplayer-friend/join', component: WaitingRoomFriendComponent },
    { path: 'game/multiplayer/wait', component: GameWaitMultiplayerPageComponent },

    { path: 'connexions', component: ConnexionsHistoryComponent },
    { path: 'statistics', component: StatisticsPageComponent },
    { path: 'user-account', component: UserAccountPageComponent },
    { path: 'virtual-store', component: VirtualStorePageComponent },
    // { path: 'admin/scores', component: BestScoresPageComponent },
    // { path: 'admin/games', component: AdminGamesPageComponent },
    // { path: 'admin/dictionaries', component: AdminDictionariesPageComponent },
    // { path: 'admin/bots', component: AdminBotPageComponent },
    // { path: 'material', component: MaterialPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'sign-up', component: SignUpPageComponent },
    { path: 'chat', component: ChatPageComponent },
    { path: 'blog', component: BlogListComponent },
    { path: 'blog/:id', component: BlogPostComponent },
    { path: 'admin', component: AdminComponent, pathMatch: 'full' },
    { path: 'admin/blog/create', component: CreatePostComponent, pathMatch: 'full' },
    { path: 'admin/blog', component: AdminBlogListComponent, pathMatch: 'full' },
    { path: 'admin/blog/edit/:id', component: EditPostComponent, pathMatch: 'full' },
    { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
