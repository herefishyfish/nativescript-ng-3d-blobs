import { platformNativeScript, runNativeScriptAngularApp } from '@nativescript/angular';
import { Utils } from '@nativescript/core';
import { AppModule } from './app/app.module';

declare const jp: any;
if (global.isAndroid) {
  jp.wasabeef.takt.Takt.stock(Utils.android.getApplicationContext()).seat(jp.wasabeef.takt.Seat.TOP_CENTER).color(-65536);
} 

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});

