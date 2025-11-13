import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    FileModule,
    MulterModule.register({
      dest: './uploads',
    }),

    // --- 1. DELETE THE OLD 'public' FOLDER BLOCK ---
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    //   serveRoot: '/',
    // }),
    // --- END OF DELETE ---

    // --- 2. ADD THIS NEW BLOCK INSTEAD ---
    // This serves your real React App
    ServeStaticModule.forRoot({
      // This path goes from 'backend/dist' up to the root,
      // then into 'frontend/dist/renderer'
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist', 'renderer'),
      serveRoot: '/', // Serve it at the root URL
    }),
    // --- END OF NEW BLOCK ---

    // This is your (still needed) downloads folder
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/file/',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
