import { Construct } from 'constructs';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export interface SheriffSaleHandlerProps extends NodejsFunctionProps {
  addPrismaLayer?: boolean;
  /**
   * The path to the entry file from the root of the project.
   */
  entry: string;
}

export class SheriffSaleHandler extends NodejsFunction {
  constructor(scope: Construct, id: string, props: SheriffSaleHandlerProps) {
    const { addPrismaLayer, entry } = props;

    const rootDir = path.join(__dirname, '../../');

    super(scope, id, {
      bundling: {
        commandHooks: {
          beforeBundling(_inputDir: string, _outputDir: string) {
            return [];
          },
          beforeInstall(inputDir: string, outputDir: string) {
            return [`cp -R ${inputDir}/prisma ${outputDir}/`];
          },
          afterBundling(_inputDir: string, outputDir: string) {
            return [
              `cd ${outputDir}`,
              `npx prisma generate`,
              `rm -rf node_modules/@prisma/engines`,
              `rm -rf node_modules/@prisma/client/node_modules node_modules/.bin node_modules/prisma`,
            ];
          },
        },
        nodeModules: ['@prisma/client', 'prisma'],
      },
      entry: path.join(rootDir, entry),
      handler: 'handler',
      runtime: Runtime.NODEJS_16_X,
    });

    if (addPrismaLayer) {
      const prismaLayer = new LayerVersion(this, 'PrismaLayer', {
        compatibleRuntimes: [Runtime.NODEJS_16_X],
        description: 'Prisma Layer',
        code: Code.fromAsset(path.join(rootDir, 'src/layers/prisma'), {
          bundling: {
            image: Runtime.NODEJS_16_X.bundlingImage,
            command: [
              'bash',
              '-c',
              [
                'cp package.json package-lock.json api.js client.js /asset-output',
                'cp -r prisma /asset-output/prisma',
                'cp -r node_modules /asset-output/node_modules',
                'rm -rf /asset-output/node_modules/.cache',
                'rm -rf /asset-output/node_modules/.prisma/client/*darwin*' || true,
                'rm -rf /asset-output/node_modules/.prisma/client/*windows*' || true,
                'rm -rf /asset-output/node_modules/@prisma/engines/node_modules',
                'rm -r /asset-output/node_modules/@prisma/engines/*darwin* || true',
                'rm -r /asset-output/node_modules/@prisma/engines/*debian* || true',
                'rm -f /asset-output/node_modules/prisma/*darwin* || true',
                'rm -f /asset-output/node_modules/prisma/*debian* || true',
                'rm -f /asset-output/node_modules/prisma/*windows* || true',
                'npx prisma generate',
              ].join(' && '),
            ],
          },
        }),
        layerVersionName: `prisma-layer`,
      });

      this.addLayers(prismaLayer);
    }
  }
}
