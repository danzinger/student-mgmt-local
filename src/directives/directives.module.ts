import { NgModule } from '@angular/core';
import { TextAvatarDirective } from './text-avatar/text-avatar';

import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { OrderModule } from 'ngx-order-pipe';

@NgModule({
	declarations: [TextAvatarDirective],
	imports: [Ng2SearchPipeModule, OrderModule],
	exports: [TextAvatarDirective, Ng2SearchPipeModule, OrderModule]
})
export class DirectivesModule {}
