import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatComponent } from '@app/components/chat/chat.component';
import { CreatePrivateConversationComponent } from '@app/components/create-private-conversation/create-private-conversation.component';
import { GameWaitLoadingComponent } from '@app/components/game-wait-loading/game-wait-loading.component';
import { ObservedRackComponent } from '@app/components/observed-rack/observed-rack.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayersInfosComponent } from '@app/components/players-infos/players-infos.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { StartGameComponent } from '@app/components/start-game/start-game.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GameCreateMultiplayerPageComponent } from '@app/pages/game-create-multiplayer-page/game-create-multiplayer-page.component';
import { GameJoinMultiplayerPageComponent } from '@app/pages/game-join-multiplayer-page/game-join-multiplayer-page.component';
import { GameOptionPageComponent } from '@app/pages/game-option-page/game-option-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameWaitMultiplayerPageComponent } from '@app/pages/game-wait-multiplayer-page/game-wait-multiplayer-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ObserverPageComponent } from '@app/pages/observer-page/observer-page.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { environment } from 'src/environments/environment';
import { AddChannelDialogComponent } from './add-channel-dialog/add-channel-dialog.component';
import { BestScoresTableComponent } from './components/best-scores-table/best-scores-table.component';
import { BotsTableComponent } from './components/bots-table/bots-table.component';
import { ConversationComponent } from './components/conversation/conversation.component';
import { DictionariesTableComponent } from './components/dictionaries-table/dictionaries-table.component';
import { EditBotPopupComponent } from './components/edit-bot-popup/edit-bot-popup.component';
import { EditDictionaryPopupComponent } from './components/edit-dictionary-popup/edit-dictionary-popup.component';
import { EmojisPickerComponent } from './components/emojis-picker/emojis-picker.component';
import { FriendlistComponent } from './components/friendlist/friendlist.component';
import { GamesTableComponent } from './components/games-table/games-table.component';
import { GoalDialogDataComponent } from './components/goal-dialog-data/goal-dialog-data.component';
import { GoalComponent } from './components/goal/goal.component';
import { GoalsContainerComponent } from './components/goals-container/goals-container.component';
import { HeaderComponent } from './components/header/header.component';
import { ItemShopComponent } from './components/item-shop/item-shop.component';
import { JoinChannelDialogComponent } from './components/join-channel-dialog/join-channel-dialog.component';
import { LeaderboardDialogDataComponent } from './components/leaderboard-dialog-data/leaderboard-dialog-data.component';
import { MessagesDisplayComponent } from './components/messages-display/messages-display.component';
import { ObservedPlayAreaComponent } from './components/observed-play-area/observed-play-area.component';
import { ProfilePopupComponent } from './components/profile-popup/profile-popup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PublicityPopupComponent } from './components/publicity-popup/publicity-popup.component';
import { RatingComponent } from './components/rating/rating.component';
import { SearchDefinitionComponent } from './components/search-definition/search-definition.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { SignUpPageComponent } from './components/sign-up-page/sign-up-page.component';
import { StartGameSoloComponent } from './components/start-game-solo/start-game-solo.component';
import { UploadAvatarPopupComponent } from './components/upload-avatar-popup/upload-avatar-popup.component';
import { UploadBlogCoverPopupComponent } from './components/upload-blog-cover-popup/upload-blog-cover-popup.component';
import { UploadDictionaryPopupComponent } from './components/upload-dictionary-popup/upload-dictionary-popup.component';
import { VideoPublicityComponent } from './components/video-publicity/video-publicity.component';
import { ConfirmationPopupComponent } from './confirmation-popup/confirmation-popup.component';
import { EndGamePopupComponent } from './endgame-popup/endgame-popup.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { InvitationPopupComponent } from './invitation-popup/invitation-popup.component';
import { InviteFriendsComponent } from './invite-friends/invite-friends.component';
import { JokerPopupComponent } from './joker-popup/joker-popup.component';
import { AdminBotPageComponent } from './pages/admin-bot-page/admin-bot-page.component';
import { AdminDictionariesPageComponent } from './pages/admin-dictionaries-page/admin-dictionaries-page.component';
import { AdminGamesPageComponent } from './pages/admin-games-page/admin-games-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { AdminComponent } from './pages/admin/admin.component';
import { BestScoresPageComponent } from './pages/best-scores-page/best-scores-page.component';
import { AdminBlogListComponent } from './pages/blog/admin-blog-list/admin-blog-list.component';
import { BlogListComponent } from './pages/blog/blog-list/blog-list.component';
import { BlogPostComponent } from './pages/blog/blog-post/blog-post.component';
import { CreatePostComponent } from './pages/blog/create-post/create-post.component';
import { EditPostComponent } from './pages/blog/edit-post/edit-post.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { ConnexionsHistoryComponent } from './pages/connexions-history/connexions-history.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component';
import { UserAccountPageComponent } from './pages/user-account-page/user-account-page.component';
import { VirtualStorePageComponent } from './pages/virtual-store-page/virtual-store-page.component';
import { PseudoInputComponent } from './pseudo-input/pseudo-input.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { WaitingRoomFriendComponent } from './waiting-room-friend/waiting-room-friend.component';

// AoT requires an exported function for factories
// eslint-disable-next-line @typescript-eslint/naming-convention
const HttpLoaderFactory = (http: HttpClient) => {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        GameOptionPageComponent,
        GameCreateMultiplayerPageComponent,
        StartGameComponent,
        ObserverPageComponent,
        GameJoinMultiplayerPageComponent,
        GameWaitMultiplayerPageComponent,
        ChatComponent,
        PlayersInfosComponent,
        RackComponent,
        MessagesDisplayComponent,
        LeaderboardDialogDataComponent,
        GameWaitLoadingComponent,
        ErrorDialogComponent,
        StartGameSoloComponent,
        AdminPageComponent,
        AdminDictionariesPageComponent,
        EmojisPickerComponent,
        DictionariesTableComponent,
        EditDictionaryPopupComponent,
        GoalsContainerComponent,
        GoalComponent,
        GoalDialogDataComponent,
        AdminBotPageComponent,
        BotsTableComponent,
        EditBotPopupComponent,
        AdminGamesPageComponent,
        BestScoresPageComponent,
        GamesTableComponent,
        GoalsContainerComponent,
        GoalComponent,
        GoalDialogDataComponent,
        UploadDictionaryPopupComponent,
        ConfirmationPopupComponent,
        HeaderComponent,
        BestScoresTableComponent,
        EndGamePopupComponent,
        ConversationComponent,
        PseudoInputComponent,
        SignUpPageComponent,
        UploadAvatarPopupComponent,
        UploadBlogCoverPopupComponent,
        LoginPageComponent,
        TutorialComponent,
        VideoPublicityComponent,
        ChatPageComponent,
        AddChannelDialogComponent,
        JoinChannelDialogComponent,
        RatingComponent,
        ConnexionsHistoryComponent,
        UserAccountPageComponent,
        StatisticsPageComponent,
        SettingsComponent,
        ObservedRackComponent,
        ObservedPlayAreaComponent,
        SearchDefinitionComponent,
        ProfileComponent,
        ProfilePopupComponent,
        CreatePostComponent,
        BlogListComponent,
        BlogPostComponent,
        FriendlistComponent,
        CreatePrivateConversationComponent,
        VirtualStorePageComponent,
        ItemShopComponent,
        ShoppingCartComponent,
        JokerPopupComponent,
        EditPostComponent,
        AdminBlogListComponent,
        AdminComponent,
        InviteFriendsComponent,
        InvitationPopupComponent,
        WaitingRoomFriendComponent,
        PublicityPopupComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        MatListModule,
        MatStepperModule,
        MatMenuModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        AngularFireStorageModule,
        NgxStarRatingModule,
        MatCardModule,
        OverlayModule,
        MatSnackBarModule,
        MatGridListModule,
        MatSnackBarModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
