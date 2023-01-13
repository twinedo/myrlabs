//
//  BridgeModule.m
//  ResonanceAudioDummyApp

#import "BridgeModule.h"
#import <React/RCTLog.h>
#import <GVRKit/GVRKit.h>
#import "GVRAudioEngine.h"
#import <RNDocumentPicker.h>

@interface BridgeModule ()<GVRRendererViewControllerDelegate> {
}
@end
@implementation BridgeModule

GVRAudioEngine *_gvr_audio_engine;
int _sound_object_id;
int _success_source_id;
NSString * OBJECT_SOUND_FILE=@"";
GLfloat _cube_position[3];
NSString *cloudPath = @"";

RCT_EXPORT_MODULE(BridgeModule);


RCT_EXPORT_METHOD(playAudio)
{
  [_gvr_audio_engine start];
  [_gvr_audio_engine preloadSoundFile:cloudPath];
  [_gvr_audio_engine playSound:_sound_object_id loopingEnabled:true];

}

RCT_EXPORT_METHOD(stopAudio)
{
  [_gvr_audio_engine stopSound:_sound_object_id];
  [_gvr_audio_engine stop];
  
  _gvr_audio_engine = [[GVRAudioEngine alloc]initWithRenderingMode:kRenderingModeBinauralHighQuality];
  [_gvr_audio_engine preloadSoundFile:OBJECT_SOUND_FILE];
  
  // Generate seed for random number generation.
  srand48(time(0));
  
  // Spawn the first cube.
  _sound_object_id = [_gvr_audio_engine createSoundObject:OBJECT_SOUND_FILE];
  if ([_gvr_audio_engine isSourceIdValid:_sound_object_id] == true)
  {
    NSLog(@"True");
  }
  
  [_gvr_audio_engine playSound:_sound_object_id loopingEnabled:true];
}

RCT_EXPORT_METHOD(changePosition:(float)x y:(float)y z:(float)z )
{
  _cube_position[0] = x;
  _cube_position[1] = y;
  _cube_position[2] = z;


  
  
  [_gvr_audio_engine setSoundObjectPosition:_sound_object_id
                                          x: _cube_position[0]
                                          y: _cube_position[1]
                                          z: _cube_position[2]];

}
-(id)readFromDocumentDBFolderPath:(NSString *)fileName
{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *appFile = [documentsDirectory stringByAppendingPathComponent:fileName];
    NSFileManager *fileManager=[NSFileManager defaultManager];
    if ([fileManager fileExistsAtPath:appFile])
    {
        NSError *error= NULL;
        NSData* data = [NSData dataWithContentsOfFile:appFile];
        id resultData = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
        if (error == NULL)
        {
            return resultData;
        }
    }
    return NULL;
}
RCT_EXPORT_METHOD(setFilePath:(NSString *)filePath )
{
  
  cloudPath = filePath;
  
  NSString *documentPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
  
  NSString *tofilePath = [documentPath stringByAppendingPathComponent:[NSString stringWithFormat:@"/%@",cloudPath.lastPathComponent]];
  
  OBJECT_SOUND_FILE = tofilePath;
  
  _gvr_audio_engine = [[GVRAudioEngine alloc]initWithRenderingMode:kRenderingModeBinauralHighQuality];
  [_gvr_audio_engine preloadSoundFile:OBJECT_SOUND_FILE];
  
  // Generate seed for random number generation.
  srand48(time(0));
  
  // Spawn the first cube.
  _sound_object_id = [_gvr_audio_engine createSoundObject:OBJECT_SOUND_FILE];
  if ([_gvr_audio_engine isSourceIdValid:_sound_object_id] == true)
  {
    NSLog(@"True");
  }
  
  [_gvr_audio_engine playSound:_sound_object_id loopingEnabled:true];
  
}
@end
