#import <Cordova/CDVPlugin.h>
#include <CommonCrypto/CommonDigest.h>

@interface AntiTamperingPlugin : CDVPlugin

@property (nonatomic, strong) NSDictionary* assetsHashes;

-(void)verify:(CDVInvokedUrlCommand*)command;

@end
