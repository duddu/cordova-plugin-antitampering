#import <Cordova/CDVPlugin.h>
#include <CommonCrypto/CommonDigest.h>

@interface AntiTamperingPlugin : CDVPlugin

@property (nonatomic, copy) NSDictionary* assetsHashes;

-(void)verify:(CDVInvokedUrlCommand*)command;

@end
