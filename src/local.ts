import { TFile, TFolder, type Vault } from "obsidian";
import type { Entity, MixedEntity } from "./baseTypes";
import { listFilesInObsFolder } from "./obsFolderLister";

export const getLocalEntityList = async (
  vault: Vault,
  syncConfigDir: boolean,
  configDir: string,
  pluginID: string
) => {
  const local: Entity[] = [];

  const localTAbstractFiles = vault.getAllLoadedFiles();
  for (const entry of localTAbstractFiles) {
    let r = {} as Entity;
    let key = entry.path;

    if (entry.path === "/") {
      // ignore
      continue;
    } else if (entry instanceof TFile) {
      let mtimeLocal: number | undefined = Math.max(
        entry.stat.mtime ?? 0,
        entry.stat.ctime
      );
      if (mtimeLocal === 0) {
        mtimeLocal = undefined;
      }
      if (mtimeLocal === undefined) {
        throw Error(
          `Your file has last modified time 0: ${key}, don't know how to deal with it`
        );
      }
      r = {
        key: entry.path,
        keyEnc: entry.path,
        mtimeCli: mtimeLocal,
        mtimeSvr: mtimeLocal,
        size: entry.stat.size,
        sizeEnc: entry.stat.size,
      };
    } else if (entry instanceof TFolder) {
      key = `${entry.path}/`;
      r = {
        key: key,
        keyEnc: key,
        size: 0,
        sizeEnc: 0,
      };
    } else {
      throw Error(`unexpected ${entry}`);
    }

    local.push(r);
  }

  if (syncConfigDir) {
    const syncFiles = await listFilesInObsFolder(configDir, vault, pluginID);
    for (const f of syncFiles) {
      local.push(f);
    }
  }

  return local;
};
