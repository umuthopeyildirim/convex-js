import { GenericId } from "../values/index.js";

/**
 * A reference to a file in storage.
 *
 * This is used in the {@link StorageReader} and {@link StorageWriter} which are accessible in
 * Convex queries and mutations via {@link QueryCtx} and {@link MutationCtx} respectively.
 *
 * @public
 */
export type StorageId = string;
export type FileStorageId = GenericId<"_storage"> | StorageId;
/**
 * Metadata for a single file as returned by {@link StorageReader.getMetadata | storage.getMetadata}.
 *
 * @public
 */
export type FileMetadata = {
  /**
   * ID for referencing the file (eg. via {@link StorageReader.getUrl | storage.getUrl})
   */
  storageId: StorageId;
  /**
   * Hex encoded sha256 checksum of file contents
   */
  sha256: string;
  /**
   * Size of the file in bytes
   */
  size: number;
  /**
   * ContentType of the file if it was provided on upload
   */
  contentType: string | null;
};

/**
 * An interface to read files from storage within Convex query functions.
 *
 * @public
 */
export interface StorageReader {
  /**
   * Get the URL for a file in storage by its `Id<"_storage">`.
   *
   * The GET response includes a standard HTTP Digest header with a sha256 checksum.
   *
   * @param storageId - The `Id<"_storage">` of the file to fetch from Convex storage.
   * @returns - A url which fetches the file via an HTTP GET, or `null` if it no longer exists.
   */
  getUrl(storageId: GenericId<"_storage">): Promise<string | null>;

  /**
   * @deprecated Passing a string is deprecated, use `storage.getUrl(Id<"_storage">)` instead.
   *
   * Get the URL for a file in storage by its {@link StorageId}.
   *
   * The GET response includes a standard HTTP Digest header with a sha256 checksum.
   *
   * @param storageId - The {@link StorageId} of the file to fetch from Convex storage.
   * @returns - A url which fetches the file via an HTTP GET, or `null` if it no longer exists.
   */
  getUrl<T extends StorageId>(
    storageId: T extends { __tableName: any } ? never : T
  ): Promise<string | null>;

  /**
   * @deprecated This function is deprecated, use `db.system.get(Id<"_storage">)` instead.
   *
   * Get metadata for a file.
   *
   * @param storageId - The `Id<"_storage">` of the file.
   * @returns - A {@link FileMetadata} object if found or `null` if not found.
   */
  getMetadata(storageId: GenericId<"_storage">): Promise<FileMetadata | null>;

  /**
   * @deprecated This function is deprecated, use `db.system.get(Id<"_storage">)` instead.
   *
   * Get metadata for a file.
   *
   * @param storageId - The {@link StorageId} of the file.
   * @returns - A {@link FileMetadata} object if found or `null` if not found.
   */
  getMetadata<T extends StorageId>(
    storageId: T extends { __tableName: any } ? never : T
  ): Promise<FileMetadata | null>;
}

/**
 * An interface to write files to storage within Convex mutation functions.
 *
 * @public
 */
export interface StorageWriter extends StorageReader {
  /**
   * Fetch a short-lived URL for uploading a file into storage.
   *
   * Upon a POST request to this URL, the endpoint will return a JSON object containing a newly allocated `Id<"_storage">`.
   *
   * The POST URL accepts an optional standard HTTP Digest header with a sha256 checksum.
   *
   * @returns - A url that allows file upload via an HTTP POST.
   */
  generateUploadUrl(): Promise<string>;
  /**
   * Delete a file from Convex storage.
   *
   * Once a file is deleted, any URLs previously generated by {@link StorageReader.getUrl} will return 404s.
   *
   * @param storageId - The `Id<"_storage">` of the file to delete from Convex storage.
   */
  delete(storageId: GenericId<"_storage">): Promise<void>;

  /**
   * @deprecated Passing a string is deprecated, use `storage.delete(Id<"_storage">)` instead.
   *
   * Delete a file from Convex storage.
   *
   * Once a file is deleted, any URLs previously generated by {@link StorageReader.getUrl} will return 404s.
   *
   * @param storageId - The {@link StorageId} of the file to delete from Convex storage.
   */
  delete<T extends StorageId>(
    storageId: T extends { __tableName: any } ? never : T
  ): Promise<void>;
}

/**
 * An interface to read and write files to storage within Convex actions and HTTP actions.
 *
 * @public
 */
export interface StorageActionWriter extends StorageWriter {
  /**
   * Get a Blob containing the file associated with the provided `Id<"_storage">`, or `null` if there is no file.
   */
  get(storageId: GenericId<"_storage">): Promise<Blob | null>;

  /**
   * @deprecated Passing a string is deprecated, use `storage.get(Id<"_storage">)` instead.
   *
   * Get a Blob containing the file associated with the provided {@link StorageId}, or `null` if there is no file.
   */
  get<T extends StorageId>(
    storageId: T extends { __tableName: any } ? never : T
  ): Promise<Blob | null>;
  /**
   * Store the file contained in the Blob.
   *
   * If provided, this will verify the sha256 checksum matches the contents of the file.
   */
  store(
    blob: Blob,
    options?: { sha256?: string }
  ): Promise<GenericId<"_storage">>;
}
